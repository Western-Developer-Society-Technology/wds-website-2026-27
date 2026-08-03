import styles from "./CarouselProgress.module.css";

/**
 * The blue rule with hollow square markers under the events row.
 *
 * The markers sit on the card pitch (766 design px) rather than being spread
 * evenly, so each one lines up with the card above it. The rule itself runs
 * off the right edge, like the card row.
 *
 * Static for now: the design shows all three squares identical, with no active
 * state. Wiring them to scroll position is part of the animation pass.
 */
export default function CarouselProgress({ count, className }) {
  return (
    <div
      className={[styles.progress, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span className={styles.track} />
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.marker} style={{ "--i": i }} />
      ))}
    </div>
  );
}
