const REFRESH_BUDGET_MS = 35000;
const ARCHIVE_BUDGET_MS = 15000;
const ARCHIVE_PAGE_SIZE = 4;

async function fetchEvents(urls, services, signal) {
  const fetched = [];
  for (let index = 0; index < urls.length; index += 4) {
    fetched.push(...await Promise.all(urls.slice(index, index + 4)
      .map((url) => services.fetchEvent(url, { signal }))));
  }
  return fetched.filter(Boolean);
}

async function upcomingEntries(userId, services, signal) {
  const entries = new Map();
  const cursors = new Set();
  let cursor = null;
  for (let page = 0; page < 10; page++) {
    const listing = await services.fetchPage(userId, "future", { cursor, signal });
    for (const entry of listing.entries) entries.set(entry.url, entry);
    if (!listing.nextCursor) return [...entries.values()];
    if (cursors.has(listing.nextCursor)) throw new Error("Luma upcoming pagination repeated a cursor.");
    cursor = listing.nextCursor;
    cursors.add(cursor);
  }
  throw new Error("Luma upcoming pagination exceeded the refresh limit.");
}

function replaceEvent(events, url, event) {
  const index = events.findIndex((saved) => saved.rsvpUrl === url || saved.id === event?.id);
  const updated = [...events];
  if (index < 0) {
    if (event) updated.push(event);
  } else if (event) updated[index] = event;
  else updated.splice(index, 1);
  return updated;
}

async function importArchivePage(page, snapshot, services, signal) {
  const knownUrls = new Set(snapshot.events.map((event) => event.rsvpUrl));
  for (const entry of page.entries.filter((entry) => entry.removed)) {
    snapshot.events = replaceEvent(snapshot.events, entry.url, null);
  }
  const newUrls = [...new Set(page.entries.filter((entry) => !entry.removed && !knownUrls.has(entry.url))
    .map((entry) => entry.url))];
  const results = await Promise.allSettled(newUrls.map((url) => services.fetchEvent(url, { signal })));
  results.forEach((result, index) => {
    if (result.status === "fulfilled") snapshot.events = replaceEvent(snapshot.events, newUrls[index], result.value);
  });
  // Save successes, but retry this page before advancing past an unavailable new event.
  return results.every((result) => result.status === "fulfilled");
}

export async function refreshEventSnapshot(profileUrl, services, saved, clock = Date.now) {
  // Leave time for database reads/writes within the existing 60-second function.
  const deadline = clock() + REFRESH_BUDGET_MS;
  const signal = AbortSignal.timeout(REFRESH_BUDGET_MS);
  const userId = await services.resolveProfile(profileUrl, { signal });
  const entries = await upcomingEntries(userId, services, signal);
  const listedUrls = new Set(entries.map((entry) => entry.url));
  const upcoming = await fetchEvents(entries.filter((entry) => !entry.removed).map((entry) => entry.url), services, signal);
  const now = clock();
  const retained = (saved?.events ?? []).filter((event) => Date.parse(event.startsAt) <= now && !listedUrls.has(event.rsvpUrl));
  const snapshot = {
    events: [...new Map([...retained, ...upcoming].map((event) => [event.id, event])).values()],
    archive: { cursor: saved?.archive?.cursor ?? null, recheckIndex: saved?.archive?.recheckIndex ?? 0 },
  };
  await services.writeSnapshot(profileUrl, snapshot);
  await services.onSaved?.();

  const beforeArchive = JSON.stringify(snapshot);
  const remaining = deadline - clock();
  let archiveStatus = "ok";
  if (remaining <= 0) return { events: snapshot.events, archiveStatus: "partial" };
  const archiveSignal = AbortSignal.timeout(Math.min(ARCHIVE_BUDGET_MS, remaining));
  const storedArchive = retained.filter((event) => Date.parse(event.endsAt) <= now);
  try {
    // Always check the newest page; continue one older page from the saved cursor.
    const cursor = snapshot.archive.cursor;
    const head = await services.fetchPage(userId, "past", { limit: ARCHIVE_PAGE_SIZE, signal: archiveSignal });
    const headComplete = await importArchivePage(head, snapshot, services, archiveSignal);
    if (!headComplete) archiveStatus = "partial";
    if (!cursor && headComplete) snapshot.archive.cursor = head.nextCursor;
    if (cursor) {
      const page = await services.fetchPage(userId, "past", { cursor, limit: ARCHIVE_PAGE_SIZE, signal: archiveSignal });
      if (await importArchivePage(page, snapshot, services, archiveSignal)) snapshot.archive.cursor = page.nextCursor;
      else archiveStatus = "partial";
    }
    // Rotate one stored event daily to catch edits, privacy changes, and removals.
    if (storedArchive.length) {
      const index = snapshot.archive.recheckIndex % storedArchive.length;
      const event = storedArchive[index];
      snapshot.archive.recheckIndex = (index + 1) % storedArchive.length;
      if (snapshot.events.some((item) => item.id === event.id)) {
        const updated = await services.fetchEvent(event.rsvpUrl, { signal: archiveSignal });
        snapshot.events = replaceEvent(snapshot.events, event.rsvpUrl, updated);
      }
    }
  } catch (error) {
    archiveStatus = "partial";
    if (error.cause === "invalid-cursor") snapshot.archive.cursor = null;
  }
  if (archiveStatus === "partial") console.warn("Luma archive update incomplete; stored events are retained for retry.");
  if (JSON.stringify(snapshot) !== beforeArchive) {
    await services.writeSnapshot(profileUrl, snapshot);
    await services.onSaved?.();
  }
  return { events: snapshot.events, archiveStatus };
}
