import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getApplication } from "../../app/apply/applicationData.js";
import { isObject, validateAnswers } from "../../app/apply/formModel.js";
import { ApplicationError, enforceApplicationRateLimit, readApplicationRequest } from "./request.js";
import { validatePdf } from "./pdf.js";
import { ensureStorageReady, uploadResume, removeResume } from "./storage.js";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

export function payloadHash(body, resumeHash, legacy = false) {
  // Preserve the original algorithm for receipts from old JSON clients.
  if (legacy) return sha256(JSON.stringify({ portfolio: body.portfolio, cycle: body.cycle, version: body.version, answers: body.answers }));
  return sha256(JSON.stringify(canonical({
    format: "resume-upload-v1", portfolio: body.portfolio, version: body.version, answers: body.answers, resumeHash,
  })));
}

async function verifyTurnstile(token) {
  const hosts = process.env.TURNSTILE_ALLOWED_HOSTNAMES?.split(",").map((host) => host.trim()).filter(Boolean);
  if (!process.env.CLOUDFLARE_SECRET_KEY || !hosts?.length) throw new ApplicationError("Verification is not configured.", 503);
  if (typeof token !== "string" || !token.length || token.length > 2048) throw new ApplicationError("Please complete the verification.");
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.CLOUDFLARE_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(10000),
  });
  if (!verification.ok) throw new ApplicationError("Verification is unavailable. Please try again.", 503);
  const result = await verification.json();
  if (result.success !== true || result.action !== "director_application" || !hosts.includes(result.hostname)) {
    throw new ApplicationError("Verification expired or failed. Please try again.");
  }
}

// Keep upload and database operations in this order so a saved row always has a URL.
export async function submitApplication(request, services = {}) {
  let uploaded;
  const remove = services.removeResume ?? removeResume;
  const discard = async () => {
    if (!uploaded) return;
    try { await remove(uploaded.file.path); } catch { /* The object can be reconciled manually. */ }
  };
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) {
      throw new ApplicationError("Please submit using the application form.", 403);
    }
    await (services.rateLimit ?? enforceApplicationRateLimit)(request);
    const { body, file, legacy } = await readApplicationRequest(request);
    if (!isObject(body) || typeof body.idempotencyKey !== "string" || !UUID_V4.test(body.idempotencyKey) || typeof body.portfolio !== "string" ||
        !isObject(body.answers) || body.website || (!legacy && Object.hasOwn(body.answers, "resume"))) {
      throw new ApplicationError("Invalid application request.");
    }
    const sql = services.sql ?? neon(process.env.DATABASE_URL);
    const bytes = file ? Buffer.from(await file.arrayBuffer()) : null;
    const resumeHash = bytes ? sha256(bytes) : null;
    const hash = payloadHash(body, resumeHash, legacy);
    const [existing] = await sql`
      SELECT id, payload_hash FROM wds_site.application_submissions
      WHERE idempotency_key = ${body.idempotencyKey}`;
    if (existing) {
      if (existing.payload_hash !== hash) throw new ApplicationError("This request ID was already used for different answers or a different resume.", 409);
      return reply({ id: existing.id });
    }
    if (process.env.APPLICATIONS_OPEN !== "true") throw new ApplicationError("Applications are currently closed.", 403);
    const form = getApplication(body.portfolio);
    if (!form) throw new ApplicationError("Application not found.", 404);
    if (legacy || body.version !== form.version) throw new ApplicationError("This form has changed. Please reload before submitting.", 409);
    const { answers, errors } = validateAnswers(form, { ...body.answers, resume: file });
    if (Object.keys(errors).length) throw new ApplicationError("Please check your answers.", 400, errors);
    if (!services.uploadResume) await (services.ensureStorageReady ?? ensureStorageReady)();
    await (services.verifyTurnstile ?? verifyTurnstile)(body.turnstileToken);

    const [duplicate] = await sql`
      SELECT id FROM wds_site.application_submissions
      WHERE lower(btrim(applicant_email)) = ${answers.email} AND portfolio = ${form.id}`;
    if (duplicate) {
      // A matching retry may have committed while verification was in progress.
      const [saved] = await sql`
        SELECT id, payload_hash FROM wds_site.application_submissions
        WHERE idempotency_key = ${body.idempotencyKey}`;
      if (saved?.payload_hash === hash) return reply({ id: saved.id });
      throw duplicateEmailError();
    }
    await (services.validatePdf ?? validatePdf)(bytes);
    uploaded = await (services.uploadResume ?? uploadResume)(bytes, resumeHash);
    const response = {
      id: randomUUID(),
      questions: form.sections.flatMap((section) => section.questions.map(({ label, ...question }) => ({
        ...question,
        question: label,
        section: { id: section.id, title: section.title },
        answer: question.id === "resume" ? uploaded.url : answers[question.id] ?? null,
        ...(question.id === "resume" ? { file: uploaded.file } : {}),
      }))),
    };
    const [row] = await sql`
      INSERT INTO wds_site.application_submissions
        (id, portfolio, form_version, applicant_name, applicant_email, response, idempotency_key, payload_hash)
      VALUES (${response.id}, ${form.id}, ${form.version}, ${answers.name}, ${answers.email},
        ${JSON.stringify(response)}::jsonb, ${body.idempotencyKey}, ${hash})
      ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
        WHERE application_submissions.payload_hash = EXCLUDED.payload_hash
      RETURNING id`;
    // Every upload has a fresh path. A losing attempt owns only its unused file.
    if (row?.id !== response.id) await discard();
    if (!row) throw new ApplicationError("This request ID was already used for different answers or a different resume.", 409);
    return reply({ id: row.id }, row.id === response.id ? 201 : 200);
  } catch (cause) {
    if (cause.code === "23505" && cause.constraint === "application_submissions_email_unique") {
      await discard(); // A confirmed constraint violation did not commit this row.
      cause = duplicateEmailError();
    }
    if (cause instanceof ApplicationError) return reply({ error: cause.message, ...(cause.errors ? { errors: cause.errors } : {}) }, cause.status);
    // An unknown DB failure may have committed. Keep its file for manual reconciliation.
    // Never return or log dependency errors: they can contain credentials/answers.
    console.error("Application submission failed: service unavailable.");
    return reply({ error: "The service is temporarily unavailable. Please try again." }, 503);
  }
}

function duplicateEmailError() {
  const message = "An application has already been submitted for this role with this email address.";
  return new ApplicationError(message, 409, { email: message });
}
