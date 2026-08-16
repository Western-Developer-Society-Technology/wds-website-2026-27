import CornerButton from "@/components/ui/CornerButton";
import EventsCarousel from "./EventsCarousel";
import styles from "./Events.module.css";

export default function Events() {
  return (
    <section className={styles.events} aria-label="Events">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headingGroup}>
            <h2 className={styles.heading}>our events</h2>
            <p className={styles.year}>24-25</p>
          </div>
          <CornerButton className={styles.cta} variant="dark">
            view all
          </CornerButton>
        </div>
      </div>
      <EventsCarousel />
    </section>
  );
}
