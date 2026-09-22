import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import EventsDirectory from "./EventsDirectory";

export const metadata = createPageMetadata({
  title: "Events & Workshops",
  description:
    "Explore Western Developers Society (WDS) events, coding workshops, hackathons, and opportunities to connect with Western University’s tech community.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <main>
      <Nav />
      <EventsDirectory />
      <Footer theme="dark" />
    </main>
  );
}
