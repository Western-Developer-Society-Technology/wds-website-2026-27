import styles from "./SectionHeading.module.css";

/**
 * The `our events²⁴⁻²⁵` / `portfolios⁷` / `the team` heading pattern:
 * Coolvetica title, an optional raised superscript, and an optional action
 * button pushed to the right.
 *
 * The superscript ratio lives here rather than in each section so it can't
 * drift: the design uses 47.297/150 and 55/170, i.e. 0.32× the title in both
 * places, raised 0.402em (of the title) above the baseline.
 */
export default function SectionHeading({
  title,
  superscript,
  action,
  size = "var(--fs-h2)",
  align = "start",
  className,
  id,
}) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-align={align}
    >
      <h2 className={styles.title} style={{ fontSize: size }} id={id}>
        {title}
        {superscript ? <sup className={styles.sup}>{superscript}</sup> : null}
      </h2>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
