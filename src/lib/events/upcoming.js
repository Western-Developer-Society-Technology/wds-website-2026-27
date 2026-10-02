import "server-only";
import { unstable_cache } from "next/cache";
import { EVENT_CACHE_TAG, EVENT_REFRESH_SECONDS, LUMA_PROFILE_URL } from "./config.js";
import { canonicalProfileUrl, fetchLumaEvent, fetchLumaUpcomingEventUrls } from "./luma.js";
import { refreshUpcomingSnapshot, upcomingEvents } from "./refresh.js";
import { readUpcomingSnapshot, writeUpcomingSnapshot } from "./snapshots.js";

const profileUrl = canonicalProfileUrl(LUMA_PROFILE_URL);

export async function syncUpcomingEvents() {
  return refreshUpcomingSnapshot(profileUrl, {
    discoverEvents: fetchLumaUpcomingEventUrls,
    fetchEvent: fetchLumaEvent,
    writeSnapshot: writeUpcomingSnapshot,
  });
}

const getCachedSnapshot = unstable_cache(
  async () => {
    const saved = await readUpcomingSnapshot(profileUrl);
    // Bootstrap once if this database has no profile snapshot yet.
    return saved ? saved.events : syncUpcomingEvents();
  },
  ["luma-profile-upcoming-v1", profileUrl],
  { revalidate: EVENT_REFRESH_SECONDS, tags: [EVENT_CACHE_TAG] },
);

export async function getUpcomingEvents() {
  return upcomingEvents(await getCachedSnapshot());
}
