import { randomUUID } from "node:crypto";
import { MAX_RESUME_BYTES } from "./resume.js";

export const RESUME_BUCKET = "application-resumes";
export const RESUME_PREFIX = "2026-27";
export const RESUME_MIME_TYPE = "application/pdf";
export const RESUME_STORAGE_SETTINGS = Object.freeze({
  bucket: RESUME_BUCKET,
  fileSizeLimit: MAX_RESUME_BYTES,
  allowedMimeTypes: [RESUME_MIME_TYPE],
  public: true,
});
export const isResumePath = (path) => typeof path === "string" &&
  new RegExp(`^${RESUME_PREFIX}/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.pdf$`).test(path);

export function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Resume storage is not configured.");
  }
  if (!key || parsed.protocol !== "https:" || parsed.pathname !== "/" ||
      (process.env.SUPABASE_RESUME_BUCKET && process.env.SUPABASE_RESUME_BUCKET !== RESUME_BUCKET) ||
      key.startsWith("sb_publishable_")) {
    throw new Error("Resume storage is not configured.");
  }
  return { url: parsed.origin, key, bucket: RESUME_BUCKET };
}

async function storageRequest(path, options = {}) {
  const { url, key } = storageConfig();
  const response = await fetch(`${url}/storage/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      // Legacy service-role JWTs also work; new secret keys use the apikey header.
      ...(key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` }),
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Resume storage request failed (${response.status}).`);
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resume storage returned an invalid response.");
  }
}

function hasExpectedSettings(bucket) {
  return bucket?.id === RESUME_STORAGE_SETTINGS.bucket &&
    bucket.name === RESUME_STORAGE_SETTINGS.bucket &&
    bucket.public === RESUME_STORAGE_SETTINGS.public &&
    Number(bucket.file_size_limit) === RESUME_STORAGE_SETTINGS.fileSizeLimit &&
    Array.isArray(bucket.allowed_mime_types) &&
    bucket.allowed_mime_types.length === RESUME_STORAGE_SETTINGS.allowedMimeTypes.length &&
    bucket.allowed_mime_types.every((type, index) => type === RESUME_STORAGE_SETTINGS.allowedMimeTypes[index]);
}

async function verifyStorageProvisioning() {
  const { bucket } = storageConfig();
  const metadata = await storageRequest(`bucket/${bucket}`);
  if (!hasExpectedSettings(metadata)) {
    throw new Error("Resume storage bucket settings are unsafe or incorrect.");
  }
}

let storageReady;
export async function ensureStorageReady() {
  storageReady ??= verifyStorageProvisioning().catch(() => {
    storageReady = undefined;
    throw new Error("Resume storage is unavailable.");
  });
  return storageReady;
}

export async function uploadResume(bytes, sha256) {
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES) throw new Error("Invalid resume size.");
  const { url, bucket } = storageConfig();
  const path = `${RESUME_PREFIX}/${randomUUID()}.pdf`;
  // A failed/uncertain upload does not establish ownership; never delete its path.
  await storageRequest(`object/${bucket}/${path}`, {
    method: "POST",
    headers: { "Content-Type": RESUME_MIME_TYPE, "Cache-Control": "max-age=3600", "x-upsert": "false" },
    body: bytes,
  });
  return {
    url: `${url}/storage/v1/object/public/${bucket}/${path}`,
    file: {
      provider: "supabase",
      bucket,
      path,
      mimeType: RESUME_MIME_TYPE,
      sizeBytes: bytes.length,
      sha256,
      access: "public",
      validationVersion: 1,
    },
  };
}

export async function removeResume(path) {
  if (!isResumePath(path)) throw new Error("Invalid resume path.");
  const { bucket } = storageConfig();
  await storageRequest(`object/${bucket}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [path] }),
  });
}
