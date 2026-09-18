import { checkRateLimit } from "@vercel/firewall";
import { validateResumeFile } from "./resume.js";

const MAX_JSON_BYTES = 64 * 1024;
const MAX_MULTIPART_BYTES = 600 * 1024;
export const APPLICATION_RATE_LIMIT_ID = "resume-application";

export class ApplicationError extends Error {
  constructor(message, status = 400, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function enforceApplicationRateLimit(request) {
  const result = await checkRateLimit(APPLICATION_RATE_LIMIT_ID, { request });
  // A missing WAF rule must fail closed instead of silently removing the only
  // distributed abuse control for this public, CPU-heavy endpoint.
  if (result.error === "not-found") {
    throw new ApplicationError("Applications are temporarily unavailable.", 503);
  }
  if (result.rateLimited) {
    throw new ApplicationError("Too many requests. Please try again later.", 429);
  }
}

export async function readApplicationRequest(request) {
  const contentType = request.headers.get("content-type") ?? "";
  const type = contentType.split(";")[0].trim().toLowerCase();
  const legacy = type === "application/json";
  if (!legacy && type !== "multipart/form-data") {
    throw new ApplicationError("Expected a form with a PDF resume.", 415);
  }

  // Bound the stream before parsing, including requests without Content-Length.
  const chunks = [];
  let size = 0;
  for await (const chunk of request.body ?? []) {
    size += chunk.byteLength;
    if (size > (legacy ? MAX_JSON_BYTES : MAX_MULTIPART_BYTES)) {
      throw new ApplicationError("Request is too large.", 413);
    }
    chunks.push(Buffer.from(chunk));
  }
  const bytes = Buffer.concat(chunks);
  let json = bytes.toString("utf8");
  let file = null;
  if (!legacy) {
    let data;
    try {
      data = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData();
    } catch {
      throw new ApplicationError("Invalid upload request.");
    }
    if ([...data.keys()].some((key) => !["payload", "resume"].includes(key)) ||
        data.getAll("payload").length !== 1 || data.getAll("resume").length !== 1) {
      throw new ApplicationError("Please upload exactly one resume.", 400, { resume: "Please upload exactly one PDF." });
    }
    json = data.get("payload");
    file = data.get("resume");
    if (typeof json !== "string" || Buffer.byteLength(json) > MAX_JSON_BYTES) {
      throw new ApplicationError("Application answers are too large.", 413);
    }
    const error = validateResumeFile(file);
    if (error) throw new ApplicationError(error, 400, { resume: error });
  }
  let body;
  try {
    body = JSON.parse(json);
  } catch {
    throw new ApplicationError("Invalid application JSON.");
  }
  return { body, file, legacy };
}
