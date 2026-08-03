import Image from "next/image";
import styles from "./EventCard.module.css";

/**
 * One event: a 708 × 472 photo with a white caption block notched into its
 * bottom-right corner. The block is shrink-to-fit — in the design it is 247px
 * wide behind "Spark Hackathon" and 291px behind "Mentorship Program" — so it
 * sizes to its text rather than taking a fixed width.
 */
export default function EventCard({ event }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            width={708}
            height={472}
            className={styles.image}
          />
        ) : (
          /* No photo yet — a flat ink block reads as intentional, a broken
             <img> does not. */
          <div className={styles.placeholder} />
        )}
      </div>

      <div className={styles.caption}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.meta}>{event.meta}</p>
      </div>
    </article>
  );
}
