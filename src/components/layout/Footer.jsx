import styles from "./Footer.module.css";

/**
 * Prompt 6 builds this out: blue pixel-checker corners, wordmark, three
 * social icons, blue barcode strip, and the giant clipped "wdswds" marquee.
 * Design: y 6280–6848, white background.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.wordmark}>western developers society</p>
      <p className={styles.note}>Not built yet — placeholder.</p>
    </footer>
  );
}
