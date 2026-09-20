"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTransition } from "@/components/Transition/TransitionProvider";
import { MENU_BUTTON_ID, MENU_OVERLAY_ID } from "@/components/Transition/timing";
import styles from "./Nav.module.css";

const DARK_SECTIONS = "[data-nav-on-dark]";

function sectionHitsNav(section, nav) {
  const navBox = nav.getBoundingClientRect();
  const box = section.getBoundingClientRect();
  return box.top < navBox.bottom && box.bottom > navBox.top;
}

export default function Nav({ intro = "done" }) {
  const navRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const { menuOpen, menuRaised, openMenu, closeMenu } = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;

    const nav = navRef.current;
    if (!nav) return undefined;

    const sections = () => [...document.querySelectorAll(DARK_SECTIONS)];
    const sync = () => {
      setOnDark(sections().some((section) => sectionHitsNav(section, nav)));
    };

    let observer;
    const observe = () => {
      observer?.disconnect();
      const targets = sections();
      if (targets.length === 0) {
        setOnDark(false);
        return;
      }

      const navBox = nav.getBoundingClientRect();
      const cutBottom = Math.max(0, window.innerHeight - navBox.bottom);
      observer = new IntersectionObserver(sync, {
        root: null,
        rootMargin: `${-Math.round(navBox.top)}px 0px ${-Math.round(cutBottom)}px 0px`,
        threshold: 0,
      });
      targets.forEach((section) => observer.observe(section));
      sync();
    };

    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [mounted]);

  if (!mounted) return null;

  const toggleMenu = () => {
    if (menuOpen) closeMenu();
    else openMenu();
  };

  return createPortal(
    <header
      ref={navRef}
      className={styles.nav}
      aria-label="Site"
      data-intro={intro}
      data-raised={menuRaised ? "true" : "false"}
      data-on-dark={onDark ? "true" : "false"}
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
