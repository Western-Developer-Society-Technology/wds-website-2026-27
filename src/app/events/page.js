import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import EventsDirectory from "./EventsDirectory";
import { getEventDirectory } from "@/lib/events/directory";

export const revalidate = 21600;

export const metadata = createPageMetadata({
  title: "Events & Workshops",
  description:
    "Explore Western Developers Society (WDS) events, coding workshops, hackathons, and opportunities to connect with Western University’s tech community.",
  path: "/events",
});

export default async function EventsPage() {
  const directory = await getEventDirectory();
  return (
    <main>
      <Nav />
      <EventsDirectory {...directory} />
      <Footer theme="dark" />
    </main>
  );
}
