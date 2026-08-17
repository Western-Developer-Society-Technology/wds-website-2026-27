import Nav from "@/components/Nav/Nav";
import styles from "../placeholder.module.css";

export const metadata = {
  title: "Hackathon Team – Western Developers Society",
};

export default function HackathonTeamPage() {
  return (
    <main className={styles.page}>
      <Nav />
      <h1 className={styles.title}>Hackathon Team</h1>
    </main>
  );
}
