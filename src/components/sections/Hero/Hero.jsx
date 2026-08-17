"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Nav from "@/components/Nav/Nav";
import Barcode from "@/components/ui/Barcode";
import CornerButton from "@/components/ui/CornerButton";
import HeroGrid from "./HeroGrid";
import HeroWordmark from "./HeroWordmark";
import styles from "./Hero.module.css";

function cssTime(styles, name, fallback) {
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") || !raw.endsWith("s") ? value : value * 1000;
}

let hasPlayedIntro = false;

export default function Hero() {
  const heroRef = useRef(null);
  const [phase, setPhase] = useState(() => (hasPlayedIntro ? "done" : "blank"));

  useEffect(() => {
    if (hasPlayedIntro) {
      setPhase("done");
      return undefined;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || window.scrollY > 10) {
      hasPlayedIntro = true;
      setPhase("done");
      return undefined;
    }

    hasPlayedIntro = true;

    const hero = heroRef.current;
    if (!hero) return undefined;

    const computed = window.getComputedStyle(hero);
    const typeDelay = cssTime(computed, "--wds-type-delay", 80);
    const stagger = cssTime(computed, "--wds-letter-stagger", 90);
    const duration = cssTime(computed, "--wds-letter-duration", 1200);
    const hold = cssTime(computed, "--wds-type-hold", 280);
    const settle = cssTime(computed, "--wds-settle-duration", 700);

    const lastLetterStart = stagger * 2;
    const markDuration = lastLetterStart + hold;
    const doneAt = typeDelay + Math.max(markDuration + settle, lastLetterStart + duration);

    const preventScroll = (event) => {
      event.preventDefault();
    };

    const preventKeys = (event) => {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeys);

    const mark = window.setTimeout(() => setPhase("mark"), typeDelay);
    const settleId = window.setTimeout(() => setPhase("settle"), typeDelay + markDuration);
    const done = window.setTimeout(() => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeys);
      setPhase("done");
    }, doneAt);

    return () => {
      window.clearTimeout(mark);
      window.clearTimeout(settleId);
      window.clearTimeout(done);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeys);
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} aria-label="Hero" data-intro={phase}>
      <Nav intro={phase} />
      <div className={styles.plusFrame} aria-hidden="true">
        <span className={`${styles.plus} ${styles.plusTl}`} />
        <span className={`${styles.plus} ${styles.plusTr}`} />
        <span className={`${styles.plus} ${styles.plusBl}`} />
        <span className={`${styles.plus} ${styles.plusBr}`} />
      </div>
      <div className={styles.inner}>
        <HeroGrid />

        <span className={styles.sideLine} aria-hidden="true" />

        <div className={styles.spacerTop} />

        <div className={styles.sideBarcode}>
          <Barcode
            orientation="horizontal"
            color="var(--ink)"
            className={styles.sideBarcodeDesk}
          />
          <Barcode
            orientation="vertical"
            color="var(--ink)"
            className={styles.sideBarcodeMob}
          />
        </div>

        <h1 className={styles.tagline}>
          building western’s tech community, line by line
        </h1>

        <CornerButton
          className={styles.join}
          href="https://buy.stripe.com/cNibJ04YJ8s78uIc0t7wA02"
        >
          join
        </CornerButton>

        <div className={styles.spacerMid} />

        <p className={styles.subtitle}>
          western
          <br />
          developers
          <br />
          society
        </p>

        <div className={styles.stage}>
          <HeroWordmark phase={phase} />
          <div className={styles.imageClip}>
            <Image
              src="/images/heroimage.png"
              alt="Western Developers Society members throwing up the W"
              fill
              priority
              sizes="(max-width: 768px) calc(100vw - 40px), min(1600px, calc(100vw - 80px))"
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.bars}>
          <div className={styles.yellows}>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
            <div className={styles.yellowBarcode}>
              <Barcode orientation="vertical" color="var(--yellow)" />
            </div>
          </div>
          <div className={styles.blue} />
        </div>

        <div className={styles.bottomPad} />
      </div>
    </section>
  );
}
