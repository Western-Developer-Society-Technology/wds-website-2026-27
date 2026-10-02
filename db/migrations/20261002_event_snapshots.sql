-- Run on Neon with the existing wds_site role or a database/schema owner.
-- The application role wds_site must already exist. Do not run on Supabase.
BEGIN;

CREATE SCHEMA IF NOT EXISTS wds_site;
CREATE TABLE IF NOT EXISTS wds_site.event_snapshots (
  source_url text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(snapshot) IN ('object', 'null'))
);

-- The SQL Editor may create the table as an owner role instead of the app role.
GRANT USAGE ON SCHEMA wds_site TO wds_site;
GRANT SELECT, INSERT, UPDATE ON wds_site.event_snapshots TO wds_site;

-- Profile URLs store {"events": [...]}. An empty list clears confirmed removals.
-- Rows persist until replaced by a complete, successful refresh.
COMMIT;
