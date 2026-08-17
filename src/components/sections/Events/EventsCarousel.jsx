"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useReveal from "@/lib/useReveal";
import { EVENTS, INITIAL_ACTIVE } from "./eventData";
import CarouselTicks from "./CarouselTicks";
import styles from "./Events.module.css";

const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 220;
const SWIPE_THRESHOLD = 40;
const LAST = EVENTS.length - 1;

// Edit these to change when the cards enter.
// ENTER_THRESHOLD: 0–1, how much of the stage must be visible.
// ENTER_ROOT_MARGIN: CSS margin on the observer box. A more negative
// bottom % waits until the section is higher on screen.
const ENTER_THRESHOLD = 0.2;
const ENTER_ROOT_MARGIN = "0px 0px -28% 0px";

function slotX(slot) {
  if (slot === 0) return 0;
  return Math.sign(slot) * (500 + (Math.abs(slot) - 1) * 230);
}

function cardStyle(slot) {
  const x = slotX(slot);
  const skewY = slot === 0 ? 0 : 15.7;
  const scale = slot === 0 ? 1.2 : 1;

  return {
    transform: `translate3d(calc(${x} * var(--cpx)), 0, 0) skewY(${skewY}deg) scale(${scale})`,
    zIndex: slot === 0 ? 30 : 20 - slot,
  };
}

function isTypingTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

export default function EventsCarousel() {
  const [active, setActive] = useState(INITIAL_ACTIVE);
  const rootRef = useRef(null);
  const inViewRef = useRef(false);
  const wheelAcc = useRef(0);
  const wheelLock = useRef(0);
  const touchStartX = useRef(null);
  const [stageRef, entered] = useReveal({
    threshold: ENTER_THRESHOLD,
    rootMargin: ENTER_ROOT_MARGIN,
  });

  const goTo = useCallback((index) => {
    setActive(Math.min(LAST, Math.max(0, index)));
  }, []);

  const step = useCallback((dir) => {
    setActive((current) => Math.min(LAST, Math.max(0, current + dir)));
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    const onWheel = (event) => {
      const dx = event.shiftKey ? event.deltaY + event.deltaX : event.deltaX;
      const dy = event.shiftKey ? 0 : event.deltaY;
      if (Math.abs(dx) <= Math.abs(dy)) return;

      event.preventDefault();

      const now = performance.now();
      if (now < wheelLock.current) {
        wheelAcc.current = 0;
        return;
      }

      wheelAcc.current += dx;
      if (Math.abs(wheelAcc.current) < WHEEL_THRESHOLD) return;

      step(wheelAcc.current > 0 ? 1 : -1);
      wheelAcc.current = 0;
      wheelLock.current = now + WHEEL_COOLDOWN;
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      io.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [step]);

  useEffect(() => {
    const onKey = (event) => {
      if (!inViewRef.current) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const current = EVENTS[active];

  return (
    <div
      ref={rootRef}
      className={styles.bleed}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const dx = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (dx > SWIPE_THRESHOLD) step(-1);
        else if (dx < -SWIPE_THRESHOLD) step(1);
      }}
    >
      <div
        ref={stageRef}
        className={styles.stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Event posters"
        tabIndex={0}
      >
        <div className={`${styles.deck} ${entered ? styles.deckIn : ""}`}>
          {EVENTS.map((event, index) => {
            const slot = index - active;
            return (
              <button
                key={event.id}
                type="button"
                className={styles.card}
                style={cardStyle(slot)}
                onClick={() => goTo(index)}
                aria-label={event.title}
                aria-current={index === active ? "true" : undefined}
              >
                <span className={styles.cardFace}>
                  <Image
                    src={event.src}
                    alt={event.alt}
                    fill
                    sizes="(max-width: 768px) 70vw, 30vw"
                    className={styles.cardImg}
                  />
                  <span
                    className={styles.tint}
                    style={{ opacity: slot === 0 ? 0 : 0.22 }}
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })}
        </div>
        <div className={`${styles.fade} ${styles.fadeLeft}`} aria-hidden="true" />
        <div className={`${styles.fade} ${styles.fadeRight}`} aria-hidden="true" />
      </div>

      <div
        key={active}
        className={`${styles.caption} ${entered ? `${styles.metaIn} ${styles.captionEnter}` : ""}`}
        aria-live="polite"
      >
        <p className={styles.title}>{current.title}</p>
        <p className={styles.date}>{current.date}</p>
      </div>

      <div className={`${styles.ticksWrap} ${entered ? styles.metaIn : ""}`}>
        <CarouselTicks active={active} onSelect={goTo} />
      </div>
    </div>
  );
}
