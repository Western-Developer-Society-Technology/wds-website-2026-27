import { neon } from "@neondatabase/serverless";
import { canonicalEventUrl, canonicalProfileUrl } from "./luma.js";

function database() {
  if (!process.env.DATABASE_URL) throw new Error("Event snapshot storage is not configured.");
  return neon(process.env.DATABASE_URL, {
    fetchOptions: { signal: AbortSignal.timeout(10000) },
  });
}

export async function readUpcomingSnapshot(sourceUrl) {
  const profileUrl = canonicalProfileUrl(sourceUrl);
  const sql = database();
  const rows = await sql`
    SELECT snapshot FROM wds_site.event_snapshots WHERE source_url = ${profileUrl}
  `;
  if (!rows.length) return null;
  const events = rows[0].snapshot?.events;
  if (!Array.isArray(events) || events.some((event) => !event || !event.id || !event.title ||
      canonicalEventUrl(event.rsvpUrl) !== event.rsvpUrl ||
      !Number.isFinite(Date.parse(event.startsAt)) || !Number.isFinite(Date.parse(event.endsAt)))) {
    throw new Error("Stored upcoming-event snapshot is invalid.");
  }
  return { events };
}

export async function writeUpcomingSnapshot(sourceUrl, events) {
  const profileUrl = canonicalProfileUrl(sourceUrl);
  const sql = database();
  await sql`
    INSERT INTO wds_site.event_snapshots (source_url, snapshot, fetched_at)
    VALUES (${profileUrl}, ${JSON.stringify({ events })}::jsonb, now())
    ON CONFLICT (source_url) DO UPDATE
      SET snapshot = EXCLUDED.snapshot, fetched_at = EXCLUDED.fetched_at
  `;
}
