"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const RATE = 0.4;

export default function HeroWordmark() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
  }, []);

  return (
    <p ref={ref} className={styles.wordmark} aria-hidden="true">
      wds
    </p>
  );
}
