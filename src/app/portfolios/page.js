import Nav from "@/components/Nav/Nav";
import PortfolioDirectory from "./PortfolioDirectory";

export const metadata = {
  title: "Portfolios – Western Developers Society",
};

export default function PortfoliosPage() {
  return (
    <main>
      <Nav />
      <PortfolioDirectory />
    </main>
  );
}
