"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Nav.module.css";

export default function Nav({ intro = "done" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <header className={styles.nav} aria-label="Site" data-intro={intro}>
      <div className={styles.inner}>
        <a href="/" className={styles.mark}>
          wds
        </a>
        <button type="button" className={styles.menu} aria-label="Menu">
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </button>
      </div>
    </header>,
    document.body,
  );
}
