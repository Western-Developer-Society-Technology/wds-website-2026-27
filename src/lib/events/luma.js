import { EVENT_IMAGE_PLACEHOLDER } from "./config.js";

const IMAGE_HOSTS = new Set(["images.lumacdn.com", "cdn.lu.ma"]);

export function canonicalProfileUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !["luma.com", "lu.ma"].includes(url.hostname) ||
      url.username || url.password || url.port || !/^\/user\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) {
    throw new Error("Expected a public Luma profile URL.");
  }
  return `https://luma.com${url.pathname.replace(/\/$/, "")}`;
}

export function canonicalEventUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !["luma.com", "lu.ma"].includes(url.hostname) ||
      url.username || url.password || url.port || !/^\/[a-zA-Z0-9-]+\/?$/.test(url.pathname)) {
    throw new Error("Expected a public Luma event URL.");
  }
  return `https://luma.com${url.pathname.replace(/\/$/, "")}`;
}

function imageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && IMAGE_HOSTS.has(url.hostname) &&
      !url.username && !url.password && !url.port ? url.href : null;
  } catch {
    return null;
  }
}

function descriptionText(node, depth = 0) {
  if (!node || depth > 20) return "";
  if (node.type === "text") return typeof node.text === "string" ? node.text : "";
  if (node.type === "hard_break") return "\n";
  const text = Array.isArray(node.content)
    ? node.content.map((child) => descriptionText(child, depth + 1)).join("")
    : "";
  return ["paragraph", "heading", "list_item"].includes(node.type) ? `${text}\n\n` : text;
}

function embeddedData(html) {
  const embedded = html.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!embedded) throw new Error("Luma public metadata was not found.");
  return JSON.parse(embedded)?.props?.pageProps?.initialData;
}

export function parseLumaProfile(html, sourceUrl) {
  const profileUrl = canonicalProfileUrl(sourceUrl);
  const user = embeddedData(html)?.user;
  const username = new URL(profileUrl).pathname.split("/").at(-1);
  if (user?.username !== username || typeof user.api_id !== "string" ||
      !/^usr-[a-zA-Z0-9]+$/.test(user.api_id)) {
    throw new Error("Luma returned unexpected profile metadata.");
  }
  return user.api_id;
}

export function parseLumaEvent(html, sourceUrl) {
  const rsvpUrl = canonicalEventUrl(sourceUrl);

  const data = embeddedData(html)?.data;
  const event = data?.event;
  if (!event || typeof event.url !== "string" ||
      canonicalEventUrl(`https://luma.com/${event.url}`) !== rsvpUrl) {
    throw new Error("Luma returned unexpected event metadata.");
  }

  if (!["public", "private", "unlisted"].includes(event.visibility)) {
    throw new Error("Luma returned an unknown event visibility.");
  }
  // A confirmed private/removed event must replace an older public snapshot.
  if (event.visibility !== "public" || event.cancelled_at || event.is_cancelled === true) return null;

  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const src = imageUrl(event.cover_url) ?? EVENT_IMAGE_PLACEHOLDER;
  if (typeof event.api_id !== "string" || !event.api_id || typeof event.name !== "string" || !event.name.trim() ||
      typeof event.start_at !== "string" || typeof event.end_at !== "string" ||
      !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start ||
      typeof event.timezone !== "string" || !event.timezone) {
    throw new Error("Luma returned incomplete public event details.");
  }

  // Intl validates the time zone and preserves local dates across DST changes.
  const dates = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timezone, month: "long", day: "numeric", year: "numeric",
  });
  const times = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timezone, hour: "numeric", minute: "2-digit", hour12: true,
  });
  const formatTime = (date) => times.format(date).replace(/\s+/g, "").toLowerCase();
  const endTime = dates.format(start) === dates.format(end)
    ? formatTime(end)
    : `${dates.format(end)}, ${formatTime(end)}`;
  const address = event.geo_address_info;
  const location = event.geo_address_visibility === "public" && address?.mode === "shown"
    ? [address.address, address.description].filter((part) => typeof part === "string" && part.trim()).join(" · ")
    : "Location shared on Luma";
  const description = descriptionText(data.description_mirror)
    .split(/\n+/)
    .filter((line) => !/^\s*location\s*:/i.test(line))
    .join(" ").replace(/\s+/g, " ").trim();

  const preview = event.show_guest_list === true && Array.isArray(data.featured_guests)
    ? data.featured_guests.filter((guest) => guest && typeof guest.name === "string" && guest.name.trim())
      .slice(0, 4).map((guest, index) => ({
        id: typeof guest.api_id === "string" ? guest.api_id : `guest-${index}`,
        name: guest.name.trim(),
        initials: guest.name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase(),
        avatarUrl: imageUrl(guest.avatar_url),
      }))
    : [];

  return {
    id: event.api_id,
    title: event.name.trim(),
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    timezone: event.timezone,
    date: dates.format(start),
    time: `${formatTime(start)} – ${endTime}`,
    location: location || "Location shared on Luma",
    src,
    alt: `${event.name.trim()} event poster`,
    description,
    guests: {
      count: Number.isSafeInteger(data.guest_count) && data.guest_count >= 0 ? data.guest_count : 0,
      preview,
    },
    rsvpUrl,
  };
}

async function publicRequest(url, accept, fetcher, signal) {
  return fetcher(url, {
    cache: "no-store", // Only a completed, normalized snapshot is persisted.
    credentials: "omit",
    headers: { Accept: accept },
    redirect: "error",
    signal: AbortSignal.any([AbortSignal.timeout(10000), ...(signal ? [signal] : [])]),
  });
}

async function responseText(response) {
  if (!response.ok) throw new Error("Luma is temporarily unavailable.");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("Luma returned an unexpectedly large response.");
  return text;
}

export async function fetchLumaEvent(sourceUrl, { fetcher = fetch, signal } = {}) {
  const url = canonicalEventUrl(sourceUrl);
  const response = await publicRequest(url, "text/html", fetcher, signal);
  if ([404, 410].includes(response.status)) return null;
  // Access blocks and rate limits are failures, not proof that an event was removed.
  return parseLumaEvent(await responseText(response), url);
}

export async function fetchLumaProfileId(sourceUrl, { fetcher = fetch, signal } = {}) {
  const profileUrl = canonicalProfileUrl(sourceUrl);
  const profile = await publicRequest(profileUrl, "text/html", fetcher, signal);
  return parseLumaProfile(await responseText(profile), profileUrl);
}

export async function fetchLumaHostedEventPage(userId, period, {
  cursor = null, limit = 50, fetcher = fetch, signal,
} = {}) {
  const url = new URL("https://api.luma.com/user/profile/events-hosting");
  url.search = new URLSearchParams({
    user_api_id: userId, period, pagination_limit: String(limit),
    ...(cursor ? { pagination_cursor: cursor } : {}),
  }).toString();
  const response = await publicRequest(url.href, "application/json", fetcher, signal);
  if (cursor && [400, 404, 410].includes(response.status)) {
    throw new Error("Luma rejected the saved archive cursor.", { cause: "invalid-cursor" });
  }
  const data = JSON.parse(await responseText(response));
  if (!Array.isArray(data?.entries) || data.entries.length > limit || typeof data.has_more !== "boolean") {
    throw new Error("Luma returned unexpected hosted-event metadata.");
  }
  const nextCursor = data.has_more ? data.next_cursor : null;
  if (data.has_more && (typeof nextCursor !== "string" || !nextCursor ||
      nextCursor.length > 2000 || nextCursor === cursor)) {
    throw new Error("Luma returned invalid hosted-event pagination.", { cause: "invalid-cursor" });
  }
  const entries = data.entries.map((entry) => {
    const event = entry?.event;
    if (!event || !["public", "private", "unlisted"].includes(event.visibility) ||
        !Array.isArray(entry.hosts) || typeof event.url !== "string") {
      throw new Error("Luma returned unexpected hosted-event details.");
    }
    const hosted = event.user_api_id === userId || entry.hosts.some((host) => host?.api_id === userId);
    const removed = !hosted || event.visibility !== "public" || Boolean(event.cancelled_at) || event.is_cancelled === true;
    if (!removed && !Number.isFinite(Date.parse(event.end_at))) {
      throw new Error("Luma returned incomplete hosted-event details.");
    }
    return { url: canonicalEventUrl(`https://luma.com/${event.url}`), removed };
  });
  return { entries, nextCursor };
}
