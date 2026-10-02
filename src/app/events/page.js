import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import EventsDirectory from "./EventsDirectory";
import { getUpcomingEvents } from "@/lib/events/upcoming";

export const revalidate = 21600;

export const metadata = createPageMetadata({
  title: "Events & Workshops",
  description:
    "Explore Western Developers Society (WDS) events, coding workshops, hackathons, and opportunities to connect with Western University’s tech community.",
  path: "/events",
});

export default async function EventsPage() {
  const upcomingEvents = await getUpcomingEvents();
  return (
    <main>
      <Nav />
      <EventsDirectory upcomingEvents={upcomingEvents} />
      <Footer theme="dark" />
    </main>
  );
}
