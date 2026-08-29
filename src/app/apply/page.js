import Nav from "@/components/Nav/Nav";
import styles from "../placeholder.module.css";

export const metadata = {
  title: "Apply – Western Developers Society",
};

export default function ApplyPage() {
  return (
    <main className={styles.page}>
      <Nav />
      <h1 className={styles.title}>Apply</h1>
    </main>
  );
}
