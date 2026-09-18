import { createSign } from "node:crypto";
import { pathToFileURL } from "node:url";
import { neon } from "@neondatabase/serverless";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4";
class SyncError extends Error {}

const SYNC_ID_HEADER = "Application ID";
const VISIBLE_BASE_HEADERS = [
  "Submitted At",
  "Applicant Name",
  "Applicant Email",
];
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
  const isCurrent = headers[0] === SYNC_ID_HEADER;
  const existingQuestionHeaders = isLegacy
    ? headers.slice(LEGACY_BASE_HEADERS.length)
    : isCurrent ? headers.slice(1 + VISIBLE_BASE_HEADERS.length) : [];
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
    return [SYNC_ID_HEADER, ...VISIBLE_BASE_HEADERS, ...questionIds(records)];
  }
  const current = headers[0] === SYNC_ID_HEADER && VISIBLE_BASE_HEADERS.every((header, index) => headers[index + 1] === header);
  const legacy = LEGACY_BASE_HEADERS.every((header, index) => headers[index] === header);
  if (!current && !legacy) {
    throw new SyncError("A portfolio tab has an unexpected header row. Refusing to overwrite it.");
  }
  return [SYNC_ID_HEADER, ...VISIBLE_BASE_HEADERS, ...questionColumns(headers, records).map(({ header }) => header)];
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
    "Submitted At": record.submitted_at,
    "Applicant Name": record.applicant_name,
    "Applicant Email": record.applicant_email,
  };

  return headers.map((header) => formatCell(
    Object.hasOwn(fields, header) ? fields[header] : questionAnswers.get(header),
    header,
  ));
}

function questionColumnForHeader(header, columns) {
  const parsed = parseQuestionHeader(header);
  return columns.find((column) => column.header === header || column.id === parsed?.id);
}

function migrateSheetRow(row, existingHeaders, headers, columns) {
  const legacy = existingHeaders[0] === LEGACY_BASE_HEADERS[0];
  const oldQuestions = legacy
    ? existingHeaders.slice(LEGACY_BASE_HEADERS.length)
    : existingHeaders.slice(1 + VISIBLE_BASE_HEADERS.length);
  const questionIndexes = new Map();
  for (const [offset, header] of oldQuestions.entries()) {
    const column = questionColumnForHeader(header, columns);
    if (!column) continue;
    const indexes = questionIndexes.get(column.id) ?? [];
    indexes.push((legacy ? LEGACY_BASE_HEADERS.length : 1 + VISIBLE_BASE_HEADERS.length) + offset);
    questionIndexes.set(column.id, indexes);
  }
  const firstValue = (indexes) => indexes?.map((index) => row[index]).find((value) => value !== undefined && value !== "") ?? "";
  const baseValues = {
    [SYNC_ID_HEADER]: row[0],
    "Submitted At": row[legacy ? 1 : 1],
    "Applicant Name": row[legacy ? 4 : 2],
    "Applicant Email": row[legacy ? 5 : 3],
  };
  return headers.map((header) => {
    if (Object.hasOwn(baseValues, header)) return formatCell(baseValues[header], header);
    const column = columns.find(({ header: columnHeader }) => columnHeader === header);
    return formatCell(firstValue(questionIndexes.get(column?.id)), header);
  });
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
  const headers = mergeHeaders(existingHeaders, records);
  const headerChanged = JSON.stringify(headers) !== JSON.stringify(existingHeaders);
  const columns = questionColumns(existingHeaders, records);
  const lastColumn = columnName(headers.length - 1);

  const dataRows = values.slice(1);
  const lastDataRow = dataRows.findLastIndex((row) => row.some(Boolean));
  if (dataRows.slice(0, lastDataRow + 1).some((row) => !row[0])) {
    throw new SyncError("A portfolio tab contains duplicate or missing application IDs.");
  }
  const existingRows = dataRows.filter((row) => row[0]);
  const ids = existingRows.map((row) => String(row[0]));
  if (new Set(ids).size !== ids.length) throw new SyncError("A portfolio tab contains duplicate application IDs.");
  const existingIds = new Set(ids);
  if (new Set(records.map((record) => record.id)).size !== records.length) throw new SyncError("Duplicate source IDs.");
  const pending = records.filter((record) => !existingIds.has(record.id));
  const migratedRows = headerChanged
    ? existingRows.map((row) => migrateSheetRow(row, existingHeaders, headers, columns))
    : existingRows;
  const pendingRows = pending.map((record) => buildSheetRow(record, headers));
  const allRows = [...migratedRows, ...pendingRows];
  if (allRows.some((row) => Buffer.byteLength(JSON.stringify(row)) > 500_000)) {
    throw new SyncError("A submission exceeds the spreadsheet row budget.");
  }
  const rowCount = Math.max(allRows.length + 1, 1);
  const sheetId = properties.sheetId;
  const oldColumnCount = Math.max(...values.map((row) => row.length), existingHeaders.length, 1);
  if (headerChanged || pendingRows.length) {
    const valuesToWrite = headerChanged ? [headers, ...allRows] : pendingRows;
    const startRow = headerChanged ? 1 : existingRows.length + 2;
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
  if (oldColumnCount > headers.length) {
    staleRanges.push(`${quotedTitle}!${columnName(headers.length)}:${columnName(oldColumnCount - 1)}`);
  }
  if (values.length > rowCount) {
    staleRanges.push(`${quotedTitle}!A${rowCount + 1}:${columnName(oldColumnCount - 1)}${values.length}`);
  }
  for (const staleRange of staleRanges) {
    await googleRequest(accessToken, valuesPath(spreadsheetId, staleRange, ":clear"), "POST", {});
  }

  const visibleRange = { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 1, endColumnIndex: headers.length };
  const formattingRange = { ...visibleRange, endRowIndex: Math.max(rowCount, 1) };
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
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 }, properties: { pixelSize: 180 }, fields: "pixelSize" } },
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 3 }, properties: { pixelSize: 190 }, fields: "pixelSize" } },
      { updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 3, endIndex: 4 }, properties: { pixelSize: 250 }, fields: "pixelSize" } },
      ...(headers.length > 4 ? [{ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: 4, endIndex: headers.length }, properties: { pixelSize: 300 }, fields: "pixelSize" } }] : []),
      { repeatCell: { range: formattingRange, cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } }, fields: "userEnteredFormat(wrapStrategy,verticalAlignment)" } },
      { repeatCell: { range: { ...visibleRange, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.93, blue: 0.97 }, verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } }, fields: "userEnteredFormat(textFormat,backgroundColor,verticalAlignment,wrapStrategy)" } },
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
