import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { getApplication } from "@/app/apply/applicationData";
import { isObject, validateAnswers } from "@/app/apply/formModel";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request) {
  const reply = (data, status = 200) => Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
  const error = (message, status) => reply({ error: message }, status);

  try {
    const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (contentType !== "application/json") return error("Expected JSON.", 415);

    // Count streamed bytes rather than trusting Content-Length.
    const chunks = [];
    let size = 0;
    for await (const chunk of request.body ?? []) {
      size += chunk.byteLength;
      if (size > MAX_BODY_BYTES) return error("Request is too large.", 413);
      chunks.push(Buffer.from(chunk));
    }

    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return error("Invalid JSON.", 400);
    }
    if (
      !isObject(body) ||
      typeof body.idempotencyKey !== "string" ||
      !UUID_V4.test(body.idempotencyKey) ||
      typeof body.portfolio !== "string" ||
      body.website
    ) {
      return error("Invalid application request.", 400);
    }
    if (!process.env.DATABASE_URL) {
      return error("Applications are not configured yet.", 503);
    }

    const sql = neon(process.env.DATABASE_URL);
    const hash = createHash("sha256").update(JSON.stringify({
      portfolio: body.portfolio,
      cycle: body.cycle,
      version: body.version,
      answers: body.answers,
    })).digest("hex");

    // Recover lost responses without consuming the same Turnstile token again.
    const [existing] = await sql`
      SELECT id, payload_hash FROM wds_site.application_submissions
      WHERE idempotency_key = ${body.idempotencyKey}`;
    if (existing) {
      return existing.payload_hash === hash
        ? reply({ id: existing.id })
        : error("This request ID was already used for different answers.", 409);
    }
    if (process.env.APPLICATIONS_OPEN !== "true") {
      return error("Applications are currently closed.", 403);
    }

    const form = getApplication(body.portfolio);
    if (!form) return error("Application not found.", 404);
    if (body.cycle !== form.cycle || body.version !== form.version) {
      return error("This form has changed. Please reload before submitting.", 409);
    }
    const { answers, errors } = validateAnswers(form, body.answers);
    if (Object.keys(errors).length) {
      return reply({ error: "Please check your answers.", errors }, 400);
    }

    const hosts = process.env.TURNSTILE_ALLOWED_HOSTNAMES
      ?.split(",").map((host) => host.trim()).filter(Boolean);
    if (!process.env.CLOUDFLARE_SECRET_KEY || !hosts?.length) {
      return error("Verification is not configured.", 503);
    }
    if (
      typeof body.turnstileToken !== "string" ||
      !body.turnstileToken.length ||
      body.turnstileToken.length > 2048
    ) {
      return error("Please complete the verification.", 400);
    }
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_SECRET_KEY,
        response: body.turnstileToken,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!verification.ok) {
      return error("Verification is unavailable. Please try again.", 503);
    }
    const result = await verification.json();
    if (
      result.success !== true ||
      result.action !== "director_application" ||
      !hosts.includes(result.hostname)
    ) {
      return error("Verification expired or failed. Please try again.", 400);
    }

    const response = {
      id: randomUUID(),
      questions: form.sections.flatMap((section) =>
        section.questions.map(({ label, ...question }) => ({
          ...question,
          question: label,
          section: { id: section.id, title: section.title },
          answer: answers[question.id] ?? null,
        })),
      ),
    };

    // The no-op update returns the original receipt if another retry saved first.
    const [row] = await sql`
      INSERT INTO wds_site.application_submissions
        (id, portfolio, cycle, form_version, applicant_name, applicant_email, response, idempotency_key, payload_hash)
      VALUES (${response.id}, ${form.id}, ${form.cycle}, ${form.version}, ${answers.name}, ${answers.email},
        ${JSON.stringify(response)}::jsonb, ${body.idempotencyKey}, ${hash})
      ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
        WHERE application_submissions.payload_hash = EXCLUDED.payload_hash
      RETURNING id`;
    return row
      ? reply({ id: row.id }, 201)
      : error("This request ID was already used for different answers.", 409);
  } catch (cause) {
    if (cause.code === "23505" && cause.constraint === "application_submissions_email_unique") {
      const message = "An application has already been submitted with this email address.";
      return reply({ error: message, errors: { email: message } }, 409);
    }
    // Database errors can contain credentials or answers. Keep them out of the response.
    return error("The service is temporarily unavailable. Please try again.", 503);
  }
}
