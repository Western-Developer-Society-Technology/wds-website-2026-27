import Asterisk from "@/components/ui/Asterisk";
import ArrowIcon from "@/components/ui/ArrowIcon";
import styles from "./HeroRail.module.css";

/**
 * The blue "join us" rail down the right edge of the hero.
 *
 * Design: x 1710–1892, y 145–998. The label is Coolvetica 140px rotated 90°
 * clockwise (so it reads top-to-bottom, first letter at the top) — confirmed
 * by rotating the reference render back. Its 384px ink length matches 140px
 * exactly, which is how the size was verified.
 */
export default function HeroRail({ href = "#join" }) {
  return (
    <a className={styles.rail} href={href}>
      <Asterisk className={`${styles.asterisk} ${styles.asteriskYellow}`} />
      <Asterisk className={`${styles.asterisk} ${styles.asteriskWhite}`} />
      <span className={styles.label}>join us</span>
      <ArrowIcon direction="down" className={styles.arrow} />
    </a>
  );
}
