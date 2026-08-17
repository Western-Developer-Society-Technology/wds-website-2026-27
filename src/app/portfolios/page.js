import Nav from "@/components/Nav/Nav";
import styles from "../placeholder.module.css";

export const metadata = {
  title: "Portfolios – Western Developers Society",
};

export default function PortfoliosPage() {
  return (
    <main className={styles.page}>
      <Nav />
      <h1 className={styles.title}>Portfolios</h1>
    </main>
  );
}
