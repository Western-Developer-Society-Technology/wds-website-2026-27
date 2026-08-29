import Asterisk from "@/components/ui/Asterisk";
import styles from "./NotificationBar.module.css";

const APPLY_HREF = "/apply";
const TICKER_ITEMS = 8;

export default function NotificationBar() {
  const items = Array.from({ length: TICKER_ITEMS }, (_, index) => (
    <span className={styles.item} key={index}>
      hiring directors
      <Asterisk className={styles.star} />
    </span>
  ));

  return (
    <aside className={styles.bar} aria-label="We are hiring">
      <p className={styles.srOnly}>
        We&apos;re hiring directors for every portfolio. Apply now.
      </p>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.stripe} aria-hidden="true" />
        <div className={styles.group}>{items}</div>
        <div className={styles.group}>{items}</div>
      </div>
      <a className={styles.cta} href={APPLY_HREF}>
        apply <span className={styles.ctaArrow} aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
