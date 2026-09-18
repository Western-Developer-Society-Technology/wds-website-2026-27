import { createSign } from "node:crypto";
import { pathToFileURL } from "node:url";
import { neon } from "@neondatabase/serverless";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4";
class SyncError extends Error {}

const SYNC_ID_HEADER = "Application ID";
const VISIBLE_BASE_HEADERS = [
  "Applicant Name",
  "Applicant Email",
];
const SUBMITTED_AT_HEADER = "Submitted At";
const PREVIOUS_CURRENT_HEADERS = [SYNC_ID_HEADER, SUBMITTED_AT_HEADER, ...VISIBLE_BASE_HEADERS];
const LEGACY_BASE_HEADERS = [
  "Submission ID",
  "Submitted At",
  "Portfolio",
  "Form Version",
  "Applicant Name",
  "Applicant Email",
];

const PORTFOLIO_TABS = new Map([
  ["development", "Development"],
  ["internals", "Internals"],
  ["careers", "Careers"],
  ["flagship", "Flagship"],
  ["finance", "Finance"],
  ["technology", "Technology"],
  ["marketing", "Marketing"],
]);

const PORTFOLIO_ORDER = [...PORTFOLIO_TABS.keys()];
const BASIC_QUESTION_IDS = new Set(["name", "email"]);

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new SyncError(`${name} is not configured in GitHub Actions repository secrets.`);
  return value;
}

function parseServiceAccount(value) {
  let credentials;
  try {
    credentials = JSON.parse(value);
  } catch {
    throw new SyncError("GOOGLE_SERVICE_ACCOUNT_JSON must contain the complete valid JSON service-account key.");
  }
  if (!credentials.client_email || !credentials.private_key) {
    throw new SyncError("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.");
  }
  return credentials;
}

function parseResponse(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      throw new Error("A submission contains invalid response JSON.");
    }
  }
  throw new Error("A submission contains invalid response data.");
}

function normalizeRecord(record) {
  return {
    ...record,
    id: String(record.id),
    portfolio: String(record.portfolio),
    response: parseResponse(record.response),
  };
}

function responseQuestions(response) {
  if (!Array.isArray(response?.questions)) return [];
  return response.questions.filter((question) =>
    question && typeof question.id === "string" && question.id && !BASIC_QUESTION_IDS.has(question.id),
  );
}

function questionTitle(question) {
  return question.question || question.id;
}

function questionColumns(existingHeaders, records) {
  const headers = existingHeaders ?? [];
  const isLegacy = headers[0] === LEGACY_BASE_HEADERS[0];
  const layout = getSheetLayout(headers);
  const existingQuestionHeaders = isLegacy
    ? headers.slice(LEGACY_BASE_HEADERS.length)
    : layout ? headers.slice(layout.questionStart, layout.questionEnd) : [];
  const currentTitles = new Map();
  const columns = [];
  const seen = new Set();
  const currentQuestions = records.flatMap((record) => responseQuestions(record.response));

  for (const question of currentQuestions) {
    currentTitles.set(question.id, questionTitle(question));
  }
  for (const header of existingQuestionHeaders) {
    const parsed = parseQuestionHeader(header);
    if (!parsed) continue;
    const matchingQuestion = currentQuestions.find((question) => questionTitle(question) === parsed.title);
    const id = matchingQuestion?.id ?? parsed.id;
    if (seen.has(id)) continue;
    seen.add(id);
    columns.push({ id, title: currentTitles.get(id) ?? parsed.title });
  }
  for (const question of currentQuestions) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    columns.push({ id: question.id, title: questionTitle(question) });
  }

  const titleCounts = new Map();
  return columns.map((column) => {
    const count = (titleCounts.get(column.title) ?? 0) + 1;
    titleCounts.set(column.title, count);
    return { ...column, header: count === 1 ? column.title : `${column.title} (${count})` };
  });
}

function parseQuestionHeader(header) {
  if (typeof header !== "string" || !header) return null;
  const legacy = header.match(/^(.*) \[([^\]]+)\]$/);
  return legacy ? { title: legacy[1], id: legacy[2] } : { title: header, id: header };
}

function getSheetLayout(headers) {
  if (LEGACY_BASE_HEADERS.every((header, index) => headers[index] === header)) {
    return {
      kind: "legacy",
      questionStart: LEGACY_BASE_HEADERS.length,
      questionEnd: headers.length,
      submittedIndex: 1,
      nameIndex: 4,
      emailIndex: 5,
    };
  }
  if (PREVIOUS_CURRENT_HEADERS.every((header, index) => headers[index] === header)) {
    return {
      kind: "previous",
      questionStart: PREVIOUS_CURRENT_HEADERS.length,
      questionEnd: headers.length,
      submittedIndex: 1,
      nameIndex: 2,
      emailIndex: 3,
    };
  }
  if (headers[0] === SYNC_ID_HEADER && headers[1] === VISIBLE_BASE_HEADERS[0] &&
      headers[2] === VISIBLE_BASE_HEADERS[1]) {
    const submittedIndex = headers.lastIndexOf(SUBMITTED_AT_HEADER);
    if (submittedIndex >= 3) {
      return {
        kind: "current",
        questionStart: 3,
        questionEnd: submittedIndex,
        submittedIndex,
        nameIndex: 1,
        emailIndex: 2,
      };
    }
  }
  return null;
}

function questionIds(records) {
  return questionColumns([], records).map(({ header }) => header);
}

export function groupSubmissions(records) {
  const groups = new Map(PORTFOLIO_ORDER.map((portfolio) => [portfolio, []]));
  const unknown = new Set();

  for (const record of records) {
    const portfolio = record.portfolio === "externals" ? "flagship" : record.portfolio;
    if (!groups.has(portfolio)) {
      unknown.add(record.portfolio);
      continue;
    }
    groups.get(portfolio).push(record);
  }

  if (unknown.size) {
    throw new Error(`Unsupported portfolio value(s): ${[...unknown].join(", ")}`);
  }
  return groups;
}

export function mergeHeaders(existingHeaders, records) {
  const headers = [...(existingHeaders ?? [])];
  while (headers.at(-1) === "") headers.pop();

  if (!headers.length) {
    return [SYNC_ID_HEADER, ...VISIBLE_BASE_HEADERS, ...questionIds(records), SUBMITTED_AT_HEADER];
  }
  if (!getSheetLayout(headers)) {
    throw new SyncError("A portfolio tab has an unexpected header row. Refusing to overwrite it.");
  }
  return [SYNC_ID_HEADER, ...VISIBLE_BASE_HEADERS, ...questionColumns(headers, records).map(({ header }) => header), SUBMITTED_AT_HEADER];
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value ?? "");
  return `${new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date)}`;
}

function formatCell(value, header) {
  if (value === undefined || value === null) return "";
  if (header === "Submitted At") return formatDateTime(value);
  if (value instanceof Date) return formatDateTime(value);
  if (Array.isArray(value)) return value.map((item) => formatCell(item)).join("\n");
  if (typeof value === "object") return Object.entries(value).map(([key, answer]) => `${key}: ${formatCell(answer)}`).join("\n");
  return String(value).replaceAll("\r\n", "\n").replaceAll("\r", "\n").trim();
}

export function buildSheetRow(record, headers) {
  const questionAnswers = new Map();
  const titleCounts = new Map();
  for (const question of responseQuestions(record.response)) {
    const title = questionTitle(question);
    const count = (titleCounts.get(title) ?? 0) + 1;
    titleCounts.set(title, count);
    questionAnswers.set(count === 1 ? title : `${title} (${count})`, question.answer);
  }
  const fields = {
    [SYNC_ID_HEADER]: record.id,
    "Applicant Name": record.applicant_name,
    "Applicant Email": record.applicant_email,
    [SUBMITTED_AT_HEADER]: record.submitted_at,
  };

  return headers.map((header) => formatCell(
    Object.hasOwn(fields, header) ? fields[header] : questionAnswers.get(header),
    header,
  ));
}

function columnName(index) {
  let number = index + 1;
  let name = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function quoteSheetTitle(title) {
  return `'${title.replaceAll("'", "''")}'`;
}

function encodeRange(range) {
  return encodeURIComponent(range);
}

export async function googleRequest(accessToken, path, method = "GET", body, attempt = 0) {
  let response;
  try {
    response = await fetch(`${GOOGLE_SHEETS_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch (cause) {
    if (cause?.code === "ERR_ASSERTION") throw cause;
    throw new SyncError("Google Sheets could not be reached. Retry the workflow.");
  }
  // Only repeat reads and deterministic range writes. A tab-creation POST can
  // have succeeded even when its response failed; the next run discovers it.
  if ([429, 500, 502, 503, 504].includes(response.status) && ["GET", "PUT"].includes(method) && attempt < 3) {
    const retryAfter = response.headers.get("retry-after");
    const seconds = /^\d+$/.test(retryAfter ?? "") ? Number(retryAfter) : (Date.parse(retryAfter) - Date.now()) / 1000;
    const delay = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 1000 * 2 ** attempt + Math.random() * 500;
    if (delay <= 30000) {
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, delay));
      return googleRequest(accessToken, path, method, body, attempt + 1);
    }
  }
  let result = {};
  try {
    result = await response.json();
  } catch {
    throw new SyncError("Google Sheets returned an invalid response.");
  }
  if (!response.ok) {
    const status = typeof result.error?.status === "string" && /^[A-Z_]+$/.test(result.error.status)
      ? ` ${result.error.status}` : "";
    const reasons = [...new Set((result.error?.details ?? []).flatMap((detail) =>
      (detail.violations ?? detail.errors ?? []).map((error) => error.reason).filter((reason) =>
        typeof reason === "string" && /^[A-Za-z_]+$/.test(reason),
      ),
    ))];
    const hint = response.status === 403
      ? " Enable the Google Sheets API and share the spreadsheet with the service-account client_email as Editor."
      : response.status === 404 ? " Check GOOGLE_SHEET_ID and share the spreadsheet with the service account." : "";
    throw new SyncError(`Google Sheets request failed (${response.status}${status}${reasons.length ? `; ${reasons.join(", ")}` : ""}).${hint}`);
  }
  return result;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

export async function getGoogleAccessToken(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const encodedHeader = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedClaims = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: GOOGLE_TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsignedToken = `${encodedHeader}.${encodedClaims}`;
  let signature;
  try {
    signature = createSign("RSA-SHA256").update(unsignedToken).sign(credentials.private_key).toString("base64url");
  } catch {
    throw new SyncError("GOOGLE_SERVICE_ACCOUNT_JSON contains an invalid private_key.");
  }
  let response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsignedToken}.${signature}`,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new SyncError("Google authentication could not be reached. Retry the workflow.");
  }
  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (!response.ok || typeof result.access_token !== "string") {
    const reason = typeof result.error === "string" && /^[a-z_]+$/.test(result.error) ? ` (${result.error})` : "";
    throw new SyncError(`Google authentication failed with status ${response.status}${reason}. Check GOOGLE_SERVICE_ACCOUNT_JSON and the service account's enabled status.`);
  }
  return result.access_token;
}

function spreadsheetPath(spreadsheetId, suffix = "") {
  return `/spreadsheets/${encodeURIComponent(spreadsheetId)}${suffix}`;
}

function valuesPath(spreadsheetId, range, suffix = "") {
  return `${spreadsheetPath(spreadsheetId)}/values/${encodeRange(range)}${suffix}`;
}

async function ensurePortfolioTabs(accessToken, spreadsheetId) {
  const fields = encodeURIComponent("sheets(properties(sheetId,title,gridProperties))");
  const data = await googleRequest(
    accessToken,
    `${spreadsheetPath(spreadsheetId)}?fields=${fields}`,
  );
  const tabs = new Map(
    (data.sheets ?? []).map(({ properties }) => [properties.title, properties]),
  );
  const missing = PORTFOLIO_ORDER
    .map((portfolio) => PORTFOLIO_TABS.get(portfolio))
    .filter((title) => !tabs.has(title));

  if (missing.length) {
    const response = await googleRequest(
      accessToken,
      `${spreadsheetPath(spreadsheetId)}:batchUpdate`,
      "POST",
      { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) },
    );
    for (const reply of response.replies ?? []) {
      const properties = reply.addSheet?.properties;
      if (properties) tabs.set(properties.title, properties);
    }
  }
  return tabs;
}

export async function syncPortfolioTab(accessToken, spreadsheetId, title, records, properties) {
  const quotedTitle = quoteSheetTitle(title);
  const valuesResponse = await googleRequest(
    accessToken,
    valuesPath(spreadsheetId, quotedTitle),
  );
  const values = valuesResponse.values ?? [];
  const existingHeaders = values[0] ?? [];
  const existingLayout = getSheetLayout(existingHeaders);
  const existingSyncedHeaders = existingLayout?.kind === "current"
    ? existingHeaders.slice(0, existingLayout.submittedIndex + 1)
    : existingHeaders;
  const headers = mergeHeaders(existingSyncedHeaders, records);
  const headerChanged = JSON.stringify(headers) !== JSON.stringify(existingSyncedHeaders);
  const lastColumn = columnName(headers.length - 1);

  const dataRows = values.slice(1);
  const lastDataRow = dataRows.findLastIndex((row) => row.some(Boolean));
  const oldSyncedColumnCount = existingSyncedHeaders.length;
  if (dataRows.slice(0, lastDataRow + 1).some((row) =>
    !row[0] && row.slice(0, oldSyncedColumnCount).some(Boolean))) {
    throw new SyncError("A portfolio tab contains duplicate or missing application IDs.");
  }
  const ids = dataRows.map((row) => row[0]).filter(Boolean).map(String);
  if (new Set(ids).size !== ids.length) throw new SyncError("A portfolio tab contains duplicate application IDs.");
  const existingIds = new Set(ids);
  if (new Set(records.map((record) => record.id)).size !== records.length) throw new SyncError("Duplicate source IDs.");
  const pending = records.filter((record) => !existingIds.has(record.id));
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const clearedRow = () => Array(headers.length).fill("");
  const reconciledRows = dataRows.map((row) => recordsById.has(String(row[0]))
    ? buildSheetRow(recordsById.get(String(row[0])), headers)
    : clearedRow());
  const pendingRows = pending.map((record) => buildSheetRow(record, headers));
  const allRows = [...reconciledRows, ...pendingRows];
  if (allRows.some((row) => Buffer.byteLength(JSON.stringify(row)) > 500_000)) {
    throw new SyncError("A submission exceeds the spreadsheet row budget.");
  }
  const rowCount = Math.max(allRows.length + 1, 1);
  const sheetId = properties.sheetId;
  const oldSubmittedIndex = existingLayout?.kind === "current" ? existingLayout.submittedIndex : null;
  const insertedColumns = oldSubmittedIndex !== null ? Math.max(0, headers.length - existingSyncedHeaders.length) : 0;
  if (insertedColumns) {
    await googleRequest(accessToken, `${spreadsheetPath(spreadsheetId)}:batchUpdate`, "POST", {
      requests: [{ insertDimension: {
        range: { sheetId, dimension: "COLUMNS", startIndex: oldSubmittedIndex, endIndex: oldSubmittedIndex + insertedColumns },
        inheritFromBefore: false,
      } }],
    });
  }
  if (headerChanged || allRows.length) {
    const valuesToWrite = headerChanged ? [headers, ...allRows] : allRows;
    const startRow = headerChanged ? 1 : 2;
    const endRow = startRow + valuesToWrite.length - 1;
    const query = new URLSearchParams({ valueInputOption: "RAW", includeValuesInResponse: "false" });
    await googleRequest(
      accessToken,
      `${valuesPath(spreadsheetId, `${quotedTitle}!A${startRow}:${lastColumn}${endRow}`)}?${query}`,
      "PUT",
      { values: valuesToWrite },
    );
  }

  const staleRanges = [];
  if (oldSyncedColumnCount > headers.length) {
    staleRanges.push(`${quotedTitle}!${columnName(headers.length)}:${columnName(oldSyncedColumnCount - 1)}`);
  }
  if (values.length > rowCount) {
    staleRanges.push(`${quotedTitle}!A${rowCount + 1}:${lastColumn}${values.length}`);
  }
  for (const staleRange of staleRanges) {
    await googleRequest(accessToken, valuesPath(spreadsheetId, staleRange, ":clear"), "POST", {});
  }

  const visibleRange = { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: headers.length };
  const formattingRange = { ...visibleRange, endRowIndex: Math.max(rowCount, 1) };
  const bodyRange = { ...formattingRange, startRowIndex: 1 };
  const questionEnd = headers.length - 1;
  const bodyFormatRequests = rowCount > 1 ? [{ repeatCell: {
    range: bodyRange,
    cell: { userEnteredFormat: {
      backgroundColor: { red: 1, green: 0.96, blue: 0.98 },
      wrapStrategy: "WRAP",
      verticalAlignment: "TOP",
      textFormat: { foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 } },
    } },
    fields: "userEnteredFormat(backgroundColor,wrapStrategy,verticalAlignment,textFormat(foregroundColor))",
  } }] : [];
  await googleRequest(accessToken, `${spreadsheetPath(spreadsheetId)}:batchUpdate`, "POST", {
    requests: [
      { updateSheetProperties: {
        properties: { sheetId, gridProperties: {
          rowCount: Math.max(properties.gridProperties?.rowCount ?? 1000, rowCount),
          columnCount: Math.max(properties.gridProperties?.columnCount ?? 26, headers.length),
          frozenRowCount: 1,
        } },
        fields: "gridProperties(rowCount,columnCount,frozenRowCount)",
      } },
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 }, properties: { hiddenByUser: true, pixelSize: 1 }, fields: "hiddenByUser,pixelSize" } },
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 190 }, fields: "pixelSize" } },
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 }, properties: { pixelSize: 250 }, fields: "pixelSize" } },
      ...(questionEnd > 3 ? [{ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 3, endIndex: questionEnd }, properties: { pixelSize: 300 }, fields: "pixelSize" } }] : []),
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: questionEnd, endIndex: headers.length }, properties: { pixelSize: 180 }, fields: "pixelSize" } },
      ...bodyFormatRequests,
      { repeatCell: { range: { ...visibleRange, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, backgroundColor: { red: 0, green: 0.318, blue: 1 }, verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } }, fields: "userEnteredFormat(textFormat,backgroundColor,verticalAlignment,wrapStrategy)" } },
      { updateBorders: { range: formattingRange, top: { style: "SOLID" }, bottom: { style: "SOLID" }, left: { style: "SOLID" }, right: { style: "SOLID" }, innerHorizontal: { style: "SOLID" }, innerVertical: { style: "SOLID" } } },
      { autoResizeDimensions: { dimensions: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: rowCount } } },
      { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 56 }, fields: "pixelSize" } },
    ],
  });

  return { total: records.length, appended: pending.length };
}

async function main() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const spreadsheetId = requiredEnv("GOOGLE_SHEET_ID");
  const credentials = parseServiceAccount(requiredEnv("GOOGLE_SERVICE_ACCOUNT_JSON"));
  const sql = neon(databaseUrl);
  let rows;
  try {
    rows = await sql`
      SELECT id, submitted_at, portfolio, form_version, applicant_name, applicant_email, response
      FROM wds_site.application_submissions
      ORDER BY submitted_at ASC, id ASC
    `;
  } catch {
    throw new SyncError("Database read failed. Check DATABASE_URL and SELECT permission on wds_site.application_submissions.");
  }
  const groups = groupSubmissions(rows.map(normalizeRecord));
  const accessToken = await getGoogleAccessToken(credentials);
  const tabs = await ensurePortfolioTabs(accessToken, spreadsheetId);

  let appended = 0;
  for (const portfolio of PORTFOLIO_ORDER) {
    const title = PORTFOLIO_TABS.get(portfolio);
    const result = await syncPortfolioTab(accessToken, spreadsheetId, title, groups.get(portfolio), tabs.get(title));
    appended += result.appended;
    console.log(`${title}: ${result.total} submissions, ${result.appended} appended`);
  }
  console.log(`Application sync complete: ${appended} rows appended.`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((cause) => {
    // A write may have succeeded even if its response was lost. The next run
    // rereads IDs before sending anything.
    const detail = cause instanceof SyncError ? cause.message : "Unexpected sync failure.";
    console.error(`Application sync failed: ${detail} Rerunning safely rechecks submission IDs.`);
    process.exitCode = 1;
  });
}
