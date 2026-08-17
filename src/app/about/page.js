import Nav from "@/components/Nav/Nav";
import styles from "../placeholder.module.css";

export const metadata = {
  title: "About – Western Developers Society",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <Nav />
      <h1 className={styles.title}>About</h1>
    </main>
  );
}
