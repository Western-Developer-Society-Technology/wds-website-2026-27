import { createSign } from "node:crypto";
import { pathToFileURL } from "node:url";
import { neon } from "@neondatabase/serverless";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4";
class SyncError extends Error {}

const BASE_HEADERS = [
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

function questionHeader(question) {
  return `${question.question || question.id} [${question.id}]`;
}

function questionIds(records) {
  const ids = [];
  const seen = new Set();
  for (const record of records) {
    for (const question of responseQuestions(record.response)) {
      const header = questionHeader(question);
      if (seen.has(header)) continue;
      seen.add(header);
      ids.push(header);
    }
  }
  return ids;
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

  if (!headers.length) return [...BASE_HEADERS, ...questionIds(records)];
  if (BASE_HEADERS.some((header, index) => headers[index] !== header)) {
    throw new Error("A portfolio tab has an unexpected header row. Refusing to overwrite it.");
  }

  // Upgrade the initial export's bare question IDs without moving its columns.
  const questions = records.flatMap((record) => responseQuestions(record.response));
  for (let index = BASE_HEADERS.length; index < headers.length; index++) {
    const question = questions.find((question) => question.id === headers[index]);
    if (question) headers[index] = questionHeader(question);
  }
  if (new Set(headers).size !== headers.length) throw new Error("Duplicate spreadsheet headers.");

  const existing = new Set(headers);
  for (const id of questionIds(records)) {
    if (existing.has(id)) continue;
    existing.add(id);
    headers.push(id);
  }
  return headers;
}

function formatCell(value) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(formatCell).join(", ");
  if (typeof value === "object") return Object.entries(value).map(([key, answer]) => `${key}: ${formatCell(answer)}`).join("\n");
  return String(value);
}

export function buildSheetRow(record, headers) {
  const answers = new Map(
    responseQuestions(record.response).map((question) => [questionHeader(question), question.answer]),
  );
  const fields = {
    "Submission ID": record.id,
    "Submitted At": record.submitted_at,
    Portfolio: record.portfolio,
    "Form Version": record.form_version,
    "Applicant Name": record.applicant_name,
    "Applicant Email": record.applicant_email,
  };

  return headers.map((header) => formatCell(
    Object.hasOwn(fields, header) ? fields[header] : answers.get(header),
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
  } catch {
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
  const lastColumn = columnName(headers.length - 1);

  const ids = values.slice(1).map((row) => row[0]).filter(Boolean).map(String);
  if (new Set(ids).size !== ids.length || values.slice(1).some((row) => !row[0] && row.some(Boolean))) {
    throw new Error("A portfolio tab contains duplicate or missing submission IDs.");
  }
  const existingIds = new Set(ids);
  if (new Set(records.map((record) => record.id)).size !== records.length) throw new Error("Duplicate source IDs.");
  const pending = records.filter((record) => !existingIds.has(record.id));
  const rowCount = Math.max(values.length, 1) + pending.length;
  const sheetId = properties.sheetId;
  const range = { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: headers.length };
  await googleRequest(accessToken, `${spreadsheetPath(spreadsheetId)}:batchUpdate`, "POST", {
    requests: [
      { updateSheetProperties: {
        properties: { sheetId, gridProperties: {
          rowCount: Math.max(properties.gridProperties.rowCount, rowCount),
          columnCount: Math.max(properties.gridProperties.columnCount, headers.length),
          frozenRowCount: 1,
        } },
        fields: "gridProperties(rowCount,columnCount,frozenRowCount)",
      } },
      { repeatCell: { range, cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } }, fields: "userEnteredFormat(wrapStrategy,verticalAlignment)" } },
      { repeatCell: { range: { ...range, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.9, green: 0.93, blue: 0.97 } } }, fields: "userEnteredFormat(textFormat,backgroundColor)" } },
      { updateBorders: { range, bottom: { style: "SOLID" }, innerHorizontal: { style: "SOLID" }, innerVertical: { style: "SOLID" } } },
    ],
  });

  if (headerChanged) {
    const query = new URLSearchParams({ valueInputOption: "RAW" });
    await googleRequest(
      accessToken,
      `${valuesPath(spreadsheetId, `${quotedTitle}!A1:${lastColumn}1`)}?${query}`,
      "PUT",
      { values: [headers] },
    );
  }

  // Bound batches by bytes, since paragraph answers vary greatly in length.
  const batches = [];
  let batch = [];
  let bytes = 0;
  for (const record of pending) {
    const row = buildSheetRow(record, headers);
    const rowBytes = Buffer.byteLength(JSON.stringify(row)) + 1;
    if (rowBytes > 500_000) throw new Error("A submission exceeds the spreadsheet row budget.");
    if (batch.length && bytes + rowBytes > 500_000) {
      batches.push(batch);
      batch = [];
      bytes = 0;
    }
    batch.push(row);
    bytes += rowBytes;
  }
  if (batch.length) batches.push(batch);
  let nextRow = Math.max(values.length, 1) + 1;
  for (const values of batches) {
    const query = new URLSearchParams({
      valueInputOption: "RAW",
      includeValuesInResponse: "false",
    });
    await googleRequest(
      accessToken,
      `${valuesPath(spreadsheetId, `${quotedTitle}!A${nextRow}:${lastColumn}${nextRow + values.length - 1}`)}?${query}`,
      "PUT",
      { values },
    );
    nextRow += values.length;
  }

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
