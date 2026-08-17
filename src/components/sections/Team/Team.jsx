import TeamMarquee from "./TeamMarquee";
import styles from "./Team.module.css";

export default function Team() {
  return (
    <section className={styles.team} aria-label="Team">
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.heading}>the team</h2>
          <p className={styles.subtitle}>
            bringing western&apos;s tech community to life
          </p>
        </div>
      </div>
      <TeamMarquee />
    </section>
  );
}
