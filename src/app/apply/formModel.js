export const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function isEmptyAnswer(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.values(value).every(isEmptyAnswer);
  return false;
}

export function hasAnswer(question, value) {
  if (question.rows) {
    return isObject(value) && question.rows.every((row) => value[row]?.length > 0);
  }
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function validChoices(value, options) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && options.includes(item)) &&
    new Set(value).size === value.length
  );
}

export function countWords(value) {
  return typeof value === "string" && value.trim() ? value.trim().split(/\s+/u).length : 0;
}

export function getCharacterLimit(question) {
  const defaults = { short: 200, email: 254, url: 2048 };
  return question.maxLength ?? defaults[question.type] ?? 4000;
}

export function validateQuestion(question, value) {
  const maxLength = getCharacterLimit(question);
  if (typeof value === "string" && value.length > maxLength) {
    return `Please use no more than ${maxLength} characters.`;
  }

  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return question.required ? "Please answer this question." : "";
  }

  if (question.type === "checkboxes") {
    return validChoices(value, question.options) && (!question.required || value.length > 0)
      ? ""
      : "Please choose valid options.";
  }

  if (question.type === "radioGrid" || question.type === "checkboxGrid") {
    if (!isObject(value) || Object.keys(value).some((row) => !question.rows.includes(row))) {
      return "Invalid grid answer.";
    }
    for (const row of question.rows) {
      const answer = value[row];
      const empty = answer === undefined || answer === "" ||
        (question.type === "checkboxGrid" && Array.isArray(answer) && answer.length === 0);
      if (empty) {
        if (question.required) return "Please answer every row.";
        continue;
      }
      const valid = question.type === "radioGrid"
        ? question.columns.includes(answer)
        : validChoices(answer, question.columns);
      if (!valid) return "Please choose valid grid options.";
    }
    return "";
  }

  if (typeof value !== "string") return "Please enter a valid answer.";

  if (question.maxWords && countWords(value) > question.maxWords) {
    return `Please use no more than ${question.maxWords} words.`;
  }

  if (["radio", "dropdown"].includes(question.type)) {
    return question.options.includes(value) ? "" : "Please choose a valid option.";
  }
  if (["scale", "rating"].includes(question.type)) {
    if (question.type === "scale" && question.options) {
      return question.options.includes(value) ? "" : "Please choose a valid rating.";
    }
    const valid = /^\d+$/.test(value) &&
      Number(value) >= (question.min ?? 1) && Number(value) <= question.max;
    return valid ? "" : "Please choose a valid rating.";
  }
  if (question.type === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? ""
      : "Please enter a valid email address.";
  }
  if (question.type === "url") {
    try {
      const url = new URL(value.trim());
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
        ? ""
        : "Please enter a valid web link.";
    } catch {
      return "Please enter a valid web link.";
    }
  }
  if (question.type === "date") {
    const date = new Date(`${value}T00:00:00Z`);
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
    return valid ? "" : "Please enter a valid date.";
  }
  if (question.type === "time") {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? "" : "Please enter a valid time.";
  }
  return ["short", "paragraph"].includes(question.type) ? "" : "Unsupported question type.";
}

export function isQuestionVisible(question, answers) {
  if (!question.showWhen) return true;
  const { questionId, min, max } = question.showWhen;
  const value = answers[questionId];
  return typeof value === "string" && /^\d+$/.test(value) &&
    Number(value) >= min && Number(value) <= max;
}

export function validateAnswers(application, answers) {
  if (!isObject(answers)) return { errors: { form: "Invalid answers." } };
  const questions = application.sections.flatMap((section) => section.questions);
  const ids = questions.map((question) => question.id);
  const errors = {};
  if (Object.keys(answers).some((id) => !ids.includes(id))) {
    errors.form = "Unknown question. Please reload the form.";
  }

  const normalized = {};
  for (const question of questions) {
    if (!isQuestionVisible(question, answers)) continue;
    const value = answers[question.id];
    const error = validateQuestion(question, value);
    if (error) {
      errors[question.id] = error;
    } else if (!isEmptyAnswer(value)) {
      normalized[question.id] = typeof value === "string" ? value.trim() : value;
      if (question.type === "email") {
        normalized[question.id] = normalized[question.id].toLowerCase();
      }
    }
  }
  return { errors, answers: normalized };
}

export function buildApplicationPayload(application, answers) {
  return {
    portfolio: application.id,
    cycle: application.cycle,
    version: application.version,
    answers: Object.fromEntries(
      application.sections.flatMap((section) => section.questions)
        .filter((question) => isQuestionVisible(question, answers) && answers[question.id] !== undefined)
        .map((question) => [question.id, answers[question.id]]),
    ),
  };
}
