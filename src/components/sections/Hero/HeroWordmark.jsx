"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./Hero.module.css";

const RATE = 0.4;
const INTRO_SCALE = 0.2;
const LETTERS = ["w", "d", "s"];

export default function HeroWordmark({ phase = "done" }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return undefined;

    const placeCentered = () => {
      const rect = wrap.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
      inner.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${INTRO_SCALE})`;
    };

    if (phase === "blank" || phase === "mark") {
      inner.style.transition = "none";
      placeCentered();

      const onResize = () => placeCentered();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    if (phase === "settle") {
      void inner.offsetWidth;
      inner.style.transition =
        "transform var(--wds-settle-duration) var(--wds-settle-ease)";
      inner.style.transform = "translate3d(0, 0, 0) scale(1)";
      return undefined;
    }

    inner.style.transition = "none";
    inner.style.transform = "";
    return undefined;
  }, [phase]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    if (phase !== "done") {
      el.style.setProperty("--wds-shift", "0px");
      return undefined;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let maxShift = 0;
    let frame = 0;

    const measure = () => {
      const stage = el.parentElement;
      if (!stage) return;
      maxShift = Math.max(0, stage.clientHeight - (el.offsetTop + el.offsetHeight));
    };

    const update = () => {
      frame = 0;
      const shift = media.matches ? 0 : Math.min(window.scrollY * RATE, maxShift);
      el.style.setProperty("--wds-shift", `${shift}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();

    const ro = new ResizeObserver(onResize);
    if (el.parentElement) ro.observe(el.parentElement);
    ro.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", update);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [phase]);

  return (
    <p ref={wrapRef} className={styles.wordmark} aria-hidden="true">
      <span ref={innerRef} className={styles.wordmarkInner}>
        {LETTERS.map((letter, index) => (
          <span
            key={letter}
            className={styles.wordmarkLetter}
            style={{ "--letter-i": String(index) }}
          >
            {letter}
          </span>
        ))}
      </span>
    </p>
  );
}
