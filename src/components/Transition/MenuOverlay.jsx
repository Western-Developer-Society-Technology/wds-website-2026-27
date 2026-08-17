"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/sections/Footer/Footer";
import { navLinks } from "./navLinks";
import {
  MENU_ITEM_DURATION,
  MENU_ITEM_EASE,
  MENU_ITEM_RISE,
  MENU_ITEM_STAGGER,
  MENU_OVERLAY_ID,
} from "./timing";
import styles from "./MenuOverlay.module.css";

export default function MenuOverlay({ active }) {
  const rootRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    setEntered(true);
    const first = rootRef.current?.querySelector("a");
    first?.focus({ preventScroll: true });
    return undefined;
  }, [active]);

  const state = active ? "in" : entered ? "out" : "idle";

  return (
    <div
      ref={rootRef}
      id={MENU_OVERLAY_ID}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={active ? undefined : "true"}
      data-state={state}
      style={{
        "--menu-item-stagger": `${MENU_ITEM_STAGGER}ms`,
        "--menu-item-dur": `${MENU_ITEM_DURATION}ms`,
        "--menu-item-ease": MENU_ITEM_EASE,
        "--menu-item-rise": MENU_ITEM_RISE,
      }}
    >
      <ul className={styles.links}>
        {navLinks.map((link, index) => (
          <li
            key={link.href}
            className={styles.item}
            style={{ "--i": String(index) }}
          >
            <a className={styles.link} href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div
        className={`${styles.footerWrap} ${styles.item}`}
        style={{ "--i": String(navLinks.length) }}
      >
        <Footer variant="overlay" />
      </div>
    </div>
  );
}
