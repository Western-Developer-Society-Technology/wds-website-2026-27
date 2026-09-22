import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import { createPageMetadata } from "@/lib/seo";
import PortfolioDirectory from "./PortfolioDirectory";

export const metadata = createPageMetadata({
  title: "Portfolios & Teams",
  description:
    "Explore the seven portfolios at Western Developers Society (WDS). Learn about our teams, director roles, and ways to contribute at Western University.",
  path: "/portfolios",
});

export default function PortfoliosPage() {
  return (
    <main>
      <Nav />
      <PortfolioDirectory />
      <Footer />
    </main>
  );
}
