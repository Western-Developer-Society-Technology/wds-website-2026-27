// Shared by the file picker and server; Storage uses this same byte limit.
export const MAX_RESUME_BYTES = 500_000;

export function validateResumeFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") return "Please upload your resume as a PDF.";
  if (!Number.isInteger(file.size) || file.size <= 0) return "Please choose a non-empty PDF.";
  if (file.size > MAX_RESUME_BYTES) return "Your resume must be 500 KB or smaller.";
  if (!/\.pdf$/i.test(file.name) || !["", "application/pdf", "application/octet-stream"].includes(file.type)) {
    return "Please choose a PDF file.";
  }
  return "";
}
