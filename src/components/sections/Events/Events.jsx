import CornerButton from "@/components/ui/CornerButton";
import PosterCarousel from "@/components/ui/PosterCarousel/PosterCarousel";
import { EVENTS, INITIAL_ACTIVE } from "./eventData";
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
          <CornerButton className={styles.cta} variant="dark" href="/events">
            view all
          </CornerButton>
        </div>
      </div>
      <PosterCarousel events={EVENTS} initialActive={INITIAL_ACTIVE} theme="light" size="large" />
    </section>
  );
}
