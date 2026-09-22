import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import HackathonDirectory from "./HackathonDirectory";

export const metadata = createPageMetadata({
  title: "WDS Hackathon Team",
  description:
    "Represent Western Developers Society at hackathons with the WDS Hackathon Team. Explore events, team opportunities, and available support for Western students.",
  path: "/hackathon-team",
});

export default function HackathonTeamPage() {
  return (
    <main>
      <Nav />
      <HackathonDirectory />
      <Footer />
    </main>
  );
}
