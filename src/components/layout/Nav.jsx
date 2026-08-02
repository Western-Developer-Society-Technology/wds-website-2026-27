import styles from "./Nav.module.css";

/**
 * Fixed wordmark + hamburger, overlaid on the hero.
 * Prompt 1 builds this out (and MenuOverlay with it).
 */
export default function Nav() {
  return (
    <header className={styles.nav}>
      <a href="#hero" className={styles.wordmark}>
        wds
      </a>
      <button type="button" className={styles.menu} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
