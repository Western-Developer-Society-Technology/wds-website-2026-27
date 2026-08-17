import Nav from "@/components/Nav/Nav";
import styles from "../placeholder.module.css";

export const metadata = {
  title: "Events – Western Developers Society",
};

export default function EventsPage() {
  return (
    <main className={styles.page}>
      <Nav />
      <h1 className={styles.title}>Events</h1>
    </main>
  );
}
