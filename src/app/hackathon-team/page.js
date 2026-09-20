import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import HackathonDirectory from "./HackathonDirectory";

export const metadata = {
  title: "Hackathon Team – Western Developers Society",
  description:
    "Represent Western Developers Society at top hackathons. Explore upcoming events and learn about the WDS Hackathon Team.",
};

export default function HackathonTeamPage() {
  return (
    <main>
      <Nav />
      <HackathonDirectory />
      <Footer />
    </main>
  );
}
