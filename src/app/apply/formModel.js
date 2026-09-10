export function hasAnswer(question, value) {
  if (question.type === "radioGrid" || question.type === "checkboxGrid") {
    return question.rows.every((row) => value?.[row]?.length > 0);
  }
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

export function validateQuestion(question, value) {
  if (question.required && !hasAnswer(question, value)) {
    return question.rows ? "Please answer every row." : "Please answer this question.";
  }
  if (question.type === "file" && value) {
    if (value.size > question.maxBytes) return `Please choose a file no larger than ${question.maxBytes / (1024 * 1024)} MB.`;
    if (!question.accept.split(",").some((extension) => value.name.toLowerCase().endsWith(extension))) return "Please choose a PDF, PNG or JPG file.";
  }
  return "";
}

// Integration boundary: a future submit handler can send this payload to Formspree.
// File objects are retained; use FormData rather than JSON when adding uploads.
export function buildApplicationPayload(application, answers) {
  return { portfolio: application.id, cycle: application.cycle, answers: { ...answers } };
}
