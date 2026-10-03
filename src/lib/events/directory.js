import "server-only";
import { unstable_cache } from "next/cache";
import { EVENT_CACHE_TAG, EVENT_REFRESH_SECONDS, EVENT_SNAPSHOT_VERSION, LUMA_PROFILE_URL } from "./config.js";
import { canonicalProfileUrl, fetchLumaEvent, fetchLumaProfileId, fetchLumaHostedEventPage } from "./luma.js";
import { refreshEventSnapshot } from "./refresh.js";
import { readEventSnapshot, writeEventSnapshot } from "./snapshots.js";
import { MANUAL_PAST_EVENTS } from "./manual.js";
import { buildEventDirectory } from "./timeline.js";

const profileUrl = canonicalProfileUrl(LUMA_PROFILE_URL);

export async function syncLumaEvents({ saved, onSaved } = {}) {
  if (saved === undefined) saved = await readEventSnapshot(profileUrl);
  return refreshEventSnapshot(profileUrl, {
    resolveProfile: fetchLumaProfileId,
    fetchPage: fetchLumaHostedEventPage,
    fetchEvent: fetchLumaEvent,
    writeSnapshot: writeEventSnapshot,
    onSaved,
  }, saved);
}

const getCachedSnapshot = unstable_cache(
  async () => {
    const saved = await readEventSnapshot(profileUrl);
    if (saved?.version === EVENT_SNAPSHOT_VERSION) return saved.events;
    // Bootstrap new databases and upgrade the earlier upcoming-only snapshot.
    try {
      return (await syncLumaEvents({ saved })).events;
    } catch (error) {
      if (saved) {
        console.warn("Luma refresh failed; serving the retained event snapshot.");
        return saved.events;
      }
      throw error;
    }
  },
  ["luma-profile-directory-v2", profileUrl],
  { revalidate: EVENT_REFRESH_SECONDS, tags: [EVENT_CACHE_TAG] },
);

export async function getEventDirectory() {
  // Classify at page regeneration, so events transition without another Luma fetch.
  return buildEventDirectory(await getCachedSnapshot(), MANUAL_PAST_EVENTS);
}
