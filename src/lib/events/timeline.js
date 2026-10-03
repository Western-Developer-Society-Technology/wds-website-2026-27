import { canonicalEventUrl } from "./luma.js";

const manualDates = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC", month: "long", day: "numeric", year: "numeric",
});

function compareStart(a, b) {
  return Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id.localeCompare(b.id);
}

export function splitLumaEvents(events, now = Date.now()) {
  const upcomingEvents = [];
  const pastEvents = [];
  for (const event of events) {
    if (!event) continue;
    (Date.parse(event.endsAt) > now ? upcomingEvents : pastEvents).push(event);
  }
  upcomingEvents.sort(compareStart);
  pastEvents.sort((a, b) => compareStart(b, a));
  return { upcomingEvents, pastEvents };
}

function manualEvent(record) {
  if (typeof record.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    throw new Error(`Manual event ${record.id} needs a YYYY-MM-DD date.`);
  }
  const date = new Date(`${record.date}T12:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== record.date) {
    throw new Error(`Manual event ${record.id} has an invalid date.`);
  }
  return {
    ...record,
    id: `manual-${record.id}`,
    source: "manual",
    date: manualDates.format(date),
    startsAt: date.toISOString(),
    endsAt: date.toISOString(),
    photos: record.photos ?? [],
  };
}

export function buildEventDirectory(lumaEvents, manualRecords = [], now = Date.now()) {
  const { upcomingEvents, pastEvents } = splitLumaEvents(lumaEvents, now);
  const liveUrls = new Set(lumaEvents.filter(Boolean).map((event) => canonicalEventUrl(event.rsvpUrl)));
  const archive = new Map();

  for (const record of manualRecords) {
    // If an imported event already has a Luma listing, prefer the live record.
    if (record.lumaUrl && liveUrls.has(canonicalEventUrl(record.lumaUrl))) continue;
    const event = manualEvent(record);
    if (Date.parse(event.endsAt) <= now) archive.set(event.id, event);
  }
  for (const event of pastEvents) {
    archive.set(event.id, {
      ...event,
      source: "luma",
      posterFit: "contain",
      body: event.description ? [event.description] : [],
      photos: [],
    });
  }
  return {
    upcomingEvents,
    pastEvents: [...archive.values()].sort((a, b) => compareStart(b, a)),
  };
}
