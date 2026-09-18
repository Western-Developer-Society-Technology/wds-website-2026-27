# Application form

Edit questions in `applicationData.js`; keep question IDs unique and `name` and
`email` required. Increment `version` when publishing changes. Work samples use
HTTP and HTTPS links. `formModel.js` validates answers on the client and server.

The form posts to `src/app/api/applications/route.js`, which Vercel runs as a
serverless function. `src/lib/applications/submit.js` verifies Turnstile, validates
the required PDF, uploads it to Supabase Storage, and inserts the application into Neon.
Each row stores normal identifying fields plus one `response` JSONB object.
Retries with unchanged answers and PDF bytes use the same request ID to avoid duplicate rows.
The ID lasts for the current page session. Reloading the page or changing answers
starts a new request. A separate database rule allows only one application per
email address for each portfolio. Email addresses are trimmed and lowercased
before storage; no verification email is sent.

## Application progress

`ApplicationProgress.jsx` renders the Looped script WDS mark in the right-hand
gutter. Valid, completed required answers determine progress. The pink stroke
traces the continuous line backward from the tail of the s toward the w, with a
slightly heavier weight than the unfilled stroke. Clearing an answer retracts
the same line; reduced-motion preferences skip the animation. Sizing and stroke
weights, including the compact mobile treatment, live in
`ApplicationProgress.module.css`.

## Response format

```json
{
  "id": "submission-uuid",
  "questions": [
    {
      "id": "interests",
      "type": "checkboxes",
      "question": "Which areas interest you?",
      "section": { "id": "portfolio", "title": "Portfolio questions" },
      "required": true,
      "options": ["Web development", "Technical workshops", "Hackathon team"],
      "answer": ["Web development", "Hackathon team"]
    }
  ]
}
```

The response ID matches the row ID. Questions stay in form order. Each question
includes its original server-side definition (text, type, options, description,
constraints) and section. Single-choice answers are strings; multiple-choice
answers are arrays. Grids preserve `rows` and `columns`, with answers keyed by row,
e.g. `{ "Weekdays": ["Evening"], "Weekends": ["Morning"] }`. Scales/ratings retain
their limits and labels. Unanswered optional questions have `answer: null`.

## Setup

The table lives in the `wds_site` schema. The connection role can create this
schema but cannot create tables in `public`. Run this once as `wds_site`:

```sql
CREATE SCHEMA IF NOT EXISTS wds_site;

CREATE TABLE IF NOT EXISTS wds_site.application_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  portfolio text NOT NULL,
  form_version integer NOT NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  response jsonb NOT NULL,
  idempotency_key uuid NOT NULL UNIQUE,
  payload_hash text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS application_submissions_email_unique
  ON wds_site.application_submissions (lower(btrim(applicant_email)), portfolio);
```

For an existing database created with the original email-only index, run this
once to allow the same applicant to apply to different portfolios while keeping
duplicate submissions for one portfolio blocked:

```sql
BEGIN;

CREATE UNIQUE INDEX application_submissions_email_portfolio_unique
  ON wds_site.application_submissions (lower(btrim(applicant_email)), portfolio);
DROP INDEX wds_site.application_submissions_email_unique;
ALTER INDEX wds_site.application_submissions_email_portfolio_unique
  RENAME TO application_submissions_email_unique;

COMMIT;
```

Set these in Vercel's environment settings (and ignored `.env` for local use):

- `DATABASE_URL`: Neon connection string.
- `CLOUDFLARE_SITE_KEY`: public key for a production Cloudflare Managed widget.
- `CLOUDFLARE_SECRET_KEY`: its server-side secret.
- `TURNSTILE_ALLOWED_HOSTNAMES`: `westerndevsociety.ca,www.westerndevsociety.ca`.
- `APPLICATIONS_OPEN`: `true` when ready to accept submissions; closed otherwise.
- `SUPABASE_URL`: the hiring project's HTTPS URL.
- `SUPABASE_SECRET_KEY`: a server-only secret API key (not the Postgres password).
- `SUPABASE_RESUME_BUCKET`: `application-resumes` (the dedicated public-download bucket).

Run `db/migrations/20260918_resume_storage.sql` on Supabase. It is repeatable,
preserves existing objects, and denies anonymous/authenticated listing and writes,
even if another policy grants broad access. Public object downloads bypass SELECT
RLS. Never expose the secret key to the browser. The Neon connection cannot apply
this Supabase migration.

PDFs use random, non-overwriting paths and unsigned public URLs, with no expiry.
Deployments and Sheets sync do not delete files. Only a confirmed unused upload is
automatically removed; uncertain database commits retain their PDFs. Reconcile
orphans manually against `response.questions[].file.path`, after in-flight requests
finish; never delete by age alone. Do not enable lifecycle cleanup for this bucket.
Keep the Supabase project active/funded and retain its bucket and objects for at
least two months after hiring (preferably indefinitely). Provider availability,
project suspension/deletion, and administrator actions prevent an absolute
permanence guarantee. Storage is not a backup; retain a separate backup if needed.

The form discloses that applications and resume links are public. A public Sheet
exposes every exported answer and email; public access does not mean edit access.
Restrict spreadsheet editing to the service account and trusted administrators.

## Google Sheets sync

`.github/workflows/sync-applications.yml` runs the read-only sync hourly and can
also be started manually from GitHub Actions. It creates one tab per portfolio,
uses the application ID to avoid duplicate rows, and logs counts or a generic failure. Share the
Google Sheet with the service account email as an editor and add these GitHub Actions
repository secrets:

- `SHEETS_DATABASE_URL`: a read-only database connection string.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: the complete service-account JSON document.
- `GOOGLE_SHEETS_SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the Sheet URL.

The Google Sheets API must be enabled in the service account's Google Cloud
project. The workflow does not use Vercel and does not need Vercel credentials.

The export shows submitted time, applicant name/email, and one readable question
column per answer; Submission ID, portfolio, and form version are omitted from the
reviewer view. A hidden first column stores the application ID solely for
idempotency. Question IDs are not displayed. Answers preserve paragraph breaks,
wrap in wide columns, and rows auto-size. Headers are frozen and borders separate
the answers. Historical `externals` records go in the Flagship tab. Writes use
`RAW` so answers cannot execute spreadsheet formulas. New columns and row capacity
grow as needed, and existing legacy exports are migrated on their next sync. The
synced section runs from the hidden ID column through the final `Submitted At`
column. Each run reconciles that section against the database: current rows are
refreshed, new rows are added, and deleted applications have their synced cells
cleared. Reviewer-owned columns to the right are never written or formatted; notes
on a deleted application's row are therefore preserved beside an otherwise blank
synced section. Rate-limited/transient reads and deterministic range writes retry
with bounded backoff.

GitHub's concurrency group is the single-writer lock. Run manual syncs through
`workflow_dispatch`, not concurrently from a local terminal or another repository.
Do not move/delete/edit IDs or sort the underlying rows while syncing; use filter
views instead. The hourly schedule runs only on the default branch, may be delayed
or skipped by GitHub, and may be disabled after 60 days of repository inactivity.
Monitor failed/missing runs and dispatch a catch-up run; all saved applications are
read on every run, so missed hours do not discard submissions.

The server page passes only the public site key to the widget. The API checks
Turnstile's success, action, and hostname; there is no test-key bypass.
The public site redirects to `www.westerndevsociety.ca`, so that hostname must be
allowed. For local testing, also allow `localhost` in Cloudflare's widget settings
and `TURNSTILE_ALLOWED_HOSTNAMES`.

The ignored `.env` file is local only. Set the variables above in Vercel's Production
environment before deploying. Environment changes require a new deployment.

## Before opening applications

1. Confirm the question content; increment `version` when changing it.
2. Create the database table and configure the environment variables above.
3. Run `npm test`, `npm run test:build`, `npm run lint`, and `npm audit --omit=dev`.
   The built-route test exercises QPDF after Next compilation with mocked services.
4. Test on a preview deployment with its own database and allowed Turnstile hostname.
   Confirm a successful receipt matches the saved row, a retry returns the same
   receipt, invalid verification is rejected, and closed applications cannot be saved.
5. Enable `APPLICATIONS_OPEN=true` in production and redeploy when those checks pass.

The API rate-limits `POST /api/applications` via Vercel Firewall (rule ID `resume-application`, 60 req/IP/60s). Configure and publish that rule before opening uploads; requests fail closed without it.
Vercel and Neon usage counts toward the limits of the configured plans.
