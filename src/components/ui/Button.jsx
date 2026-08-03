import ArrowIcon from "./ArrowIcon";
import styles from "./Button.module.css";

/**
 * The label + ↗ rectangle used across the page: `learn more` (blue) in What We
 * Do, `view all` (ink) in Events and Portfolios. Same object, different fill.
 *
 * Design geometry, measured off the `learn more` instance: 238 × 66 box,
 * 22px left / 24px right padding, 17px gap between label and arrow.
 */
export default function Button({
  href = "#",
  variant = "blue",
  children,
  className,
}) {
  return (
    <a
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      href={href}
    >
      <span className={styles.label}>{children}</span>
      <ArrowIcon direction="up-right" className={styles.arrow} />
    </a>
  );
}
