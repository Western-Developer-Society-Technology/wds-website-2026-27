import Nav from "@/components/Nav/Nav";
import EventsDirectory from "./EventsDirectory";

export const metadata = {
  title: "Events – Western Developers Society",
};

export default function EventsPage() {
  return (
    <main>
      <Nav />
      <EventsDirectory />
    </main>
  );
}
