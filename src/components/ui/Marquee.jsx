import styles from "./Marquee.module.css";

/**
 * Infinite horizontal ticker.
 *
 * The track holds the content twice and translates by exactly -50%, which is
 * what makes the loop seamless — translating by a pixel amount leaves a visible
 * jump at the wrap. Pure CSS so it never stalls waiting on hydration.
 *
 * Decorative: the same words appear as real content elsewhere on the page, so
 * the whole thing is hidden from assistive tech rather than read out N times.
 */
export default function Marquee({
  text,
  repeat = 8,
  duration = "25s",
  reverse = false,
  className,
}) {
  const items = Array.from({ length: repeat * 2 }, (_, i) => (
    <span key={i} className={styles.item}>
      {text}
    </span>
  ));

  return (
    <div
      className={[styles.marquee, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={{ "--duration": duration }}
      data-reverse={reverse ? "" : undefined}
    >
      <div className={styles.track}>{items}</div>
    </div>
  );
}
