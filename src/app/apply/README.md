# Application form

Edit questions in `applicationData.js`; keep question IDs unique and `name` and
`email` required. Increment `version` when publishing changes. Work samples use
HTTP and HTTPS links. `formModel.js` validates answers on the client and server.

The form posts to `src/app/api/applications/route.js`, which Vercel runs as a
serverless function. It verifies Turnstile and inserts a submission into Neon.
Each row stores normal identifying fields plus one `response` JSONB object.
Retries with unchanged answers use the same request ID to avoid duplicate rows.
The ID lasts for the current page session. Reloading the page or changing answers
starts a new request. A separate database rule allows only one application per
email address across the entire submissions table. Email addresses are trimmed
and lowercased before storage; no verification email is sent.

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
  ON wds_site.application_submissions (lower(btrim(applicant_email)));
```

Set these in Vercel's environment settings (and ignored `.env` for local use):

- `DATABASE_URL`: Neon connection string.
- `CLOUDFLARE_SITE_KEY`: public key for a production Cloudflare Managed widget.
- `CLOUDFLARE_SECRET_KEY`: its server-side secret.
- `TURNSTILE_ALLOWED_HOSTNAMES`: `westerndevsociety.ca,www.westerndevsociety.ca`.
- `APPLICATIONS_OPEN`: `true` when ready to accept submissions; closed otherwise.

The server page passes only the public site key to the widget. The API checks
Turnstile's success, action, and hostname; there is no test-key bypass.
The public site redirects to `www.westerndevsociety.ca`, so that hostname must be
allowed. For local testing, also allow `localhost` in Cloudflare's widget settings
and `TURNSTILE_ALLOWED_HOSTNAMES`.

The ignored `.env` file is local only. Set all five variables in Vercel's Production
environment before deploying. Environment changes require a new deployment.

## Before opening applications

1. Confirm the question content; increment `version` when changing it.
2. Create the database table and configure the environment variables above.
3. Run `npm test`, `npm run lint`, `npm run build`, and `npm audit --omit=dev`.
4. Test on a preview deployment with its own database and allowed Turnstile hostname.
   Confirm a successful receipt matches the saved row, a retry returns the same
   receipt, invalid verification is rejected, and closed applications cannot be saved.
5. Enable `APPLICATIONS_OPEN=true` in production and redeploy when those checks pass.

The API reads the database before verifying Turnstile so it can recover receipts
after a lost response. Turnstile protects new inserts, but it does not rate-limit
those reads. Use Vercel's request controls if the endpoint receives abusive traffic.
Vercel and Neon usage counts toward the limits of the configured plans.
