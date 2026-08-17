"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "@/components/Transition/TransitionProvider";
import { MENU_BUTTON_ID, MENU_OVERLAY_ID } from "@/components/Transition/timing";
import styles from "./Nav.module.css";

export default function Nav({ intro = "done" }) {
  const [mounted, setMounted] = useState(false);
  const { menuOpen, menuRaised, openMenu, closeMenu } = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleMenu = () => {
    if (menuOpen) closeMenu();
    else openMenu();
  };

  return createPortal(
    <header
      className={styles.nav}
      aria-label="Site"
      data-intro={intro}
      data-raised={menuRaised ? "true" : "false"}
    >
      <div className={styles.inner}>
        <a href="/" className={styles.mark}>
          wds
        </a>
        <button
          type="button"
          id={MENU_BUTTON_ID}
          className={styles.menu}
          aria-label={menuOpen ? "Close menu" : "Menu"}
          aria-expanded={menuOpen}
          aria-controls={MENU_OVERLAY_ID}
          data-open={menuOpen ? "true" : "false"}
          onClick={toggleMenu}
        >
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </button>
      </div>
    </header>,
    document.body,
  );
}
