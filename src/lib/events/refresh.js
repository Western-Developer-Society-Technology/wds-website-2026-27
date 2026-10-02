export async function refreshUpcomingSnapshot(profileUrl, services, now = Date.now()) {
  const urls = await services.discoverEvents(profileUrl);
  const fetched = [];
  // Bound requests without truncating the discovered list.
  for (let index = 0; index < urls.length; index += 4) {
    fetched.push(...await Promise.all(urls.slice(index, index + 4).map((url) => services.fetchEvent(url))));
  }
  const events = upcomingEvents(fetched, now);
  // One atomic write after the entire refresh succeeds. Failures retain the old list.
  await services.writeSnapshot(profileUrl, events);
  return events;
}

export function upcomingEvents(events, now = Date.now()) {
  return events.filter((event) => event && Date.parse(event.endsAt) > now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
