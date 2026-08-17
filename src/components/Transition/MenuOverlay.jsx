"use client";

import { useEffect, useRef } from "react";
import Footer from "@/components/sections/Footer/Footer";
import { navLinks } from "./navLinks";
import { MENU_OVERLAY_ID } from "./timing";
import styles from "./MenuOverlay.module.css";

export default function MenuOverlay({ active }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const first = rootRef.current?.querySelector("a");
    first?.focus({ preventScroll: true });
    return undefined;
  }, [active]);

  return (
    <div
      ref={rootRef}
      id={MENU_OVERLAY_ID}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={active ? undefined : "true"}
    >
      <ul className={styles.links}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <a className={styles.link} href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.footerWrap}>
        <Footer variant="overlay" />
      </div>
    </div>
  );
}
