import Nav from "@/components/Nav/Nav";
import Footer from "@/components/sections/Footer/Footer";
import PortfolioDirectory from "./PortfolioDirectory";

export const metadata = {
  title: "Portfolios – Western Developers Society",
};

export default function PortfoliosPage() {
  return (
    <main>
      <Nav />
      <PortfolioDirectory />
      <Footer />
    </main>
  );
}
