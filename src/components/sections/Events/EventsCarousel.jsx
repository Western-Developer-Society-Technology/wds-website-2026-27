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
const DRAG_INTENT = 6;
const CARD_STEP = 500;
const STAGE_HEIGHT = 740;
const MOMENTUM_MIN = 0.00035;
const MOMENTUM_MAX = 0.008;
const MOMENTUM_FRICTION = 0.94;
const LAST = EVENTS.length - 1;

// Edit these to change when the cards enter.
// ENTER_THRESHOLD: 0–1, how much of the stage must be visible.
// ENTER_ROOT_MARGIN: CSS margin on the observer box. A more negative
// bottom % waits until the section is higher on screen.
const ENTER_THRESHOLD = 0.2;
const ENTER_ROOT_MARGIN = "0px 0px -28% 0px";

function slotX(slot) {
  if (Math.abs(slot) <= 1) return slot * CARD_STEP;
  return Math.sign(slot) * (CARD_STEP + (Math.abs(slot) - 1) * 230);
}

function cardStyle(index, position) {
  const slot = index - position;
  const distance = Math.abs(slot);
  const x = slotX(slot);
  const skewY = 15.7 * Math.min(1, distance);
  const scale = 1 + 0.2 * Math.max(0, 1 - distance);
  const layerSlot = index - Math.round(position);

  return {
    transform: `translate3d(calc(${x} * var(--cpx)), 0, 0) skewY(${skewY}deg) scale(${scale})`,
    zIndex: layerSlot === 0 ? 30 : 20 - layerSlot,
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
  const dragRef = useRef(null);
  const momentumRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [dragPosition, setDragPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageRef, entered] = useReveal({
    threshold: ENTER_THRESHOLD,
    rootMargin: ENTER_ROOT_MARGIN,
  });

  const cancelMomentum = useCallback(() => {
    if (momentumRef.current == null) return;
    window.cancelAnimationFrame(momentumRef.current);
    momentumRef.current = null;
  }, []);

  const goTo = useCallback((index) => {
    cancelMomentum();
    setDragPosition(null);
    setActive(Math.min(LAST, Math.max(0, index)));
  }, [cancelMomentum]);

  const step = useCallback((dir) => {
    cancelMomentum();
    setDragPosition(null);
    setActive((current) => Math.min(LAST, Math.max(0, current + dir)));
  }, [cancelMomentum]);

  useEffect(() => () => cancelMomentum(), [cancelMomentum]);

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
      if (dragRef.current) return;
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
      if (!inViewRef.current || dragRef.current) return;
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

  const onPointerDown = (event) => {
    if (!event.isPrimary || event.pointerType !== "mouse" || event.button !== 0) return;

    const card = event.target.closest?.("[data-event-card]");
    if (!card) return;

    cancelMomentum();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPosition: dragPosition ?? active,
      position: dragPosition ?? active,
      step: Math.max(1, (event.currentTarget.clientHeight * CARD_STEP) / STAGE_HEIGHT),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      dragging: false,
    };
    card.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      const velocity = -(event.clientX - drag.lastX) / drag.step / elapsed;
      drag.velocity = drag.velocity * 0.5 + velocity * 0.5;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
    }

    const dx = event.clientX - drag.startX;
    if (!drag.dragging && Math.abs(dx) < DRAG_INTENT) return;

    if (!drag.dragging) setIsDragging(true);
    drag.dragging = true;
    drag.position = Math.min(LAST, Math.max(0, drag.startPosition - dx / drag.step));
    setDragPosition(drag.position);
    event.preventDefault();
  };

  const startMomentum = (startPosition, startVelocity) => {
    let position = startPosition;
    let velocity = Math.min(MOMENTUM_MAX, Math.max(-MOMENTUM_MAX, startVelocity));
    let previousTime = performance.now();

    const move = (time) => {
      const elapsed = Math.min(32, time - previousTime);
      const next = position + velocity * elapsed;
      const bounded = Math.min(LAST, Math.max(0, next));
      const hitEdge = bounded !== next;

      previousTime = time;
      position = bounded;
      velocity *= Math.pow(MOMENTUM_FRICTION, elapsed / (1000 / 60));
      setDragPosition(position);

      if (hitEdge || Math.abs(velocity) < MOMENTUM_MIN) {
        momentumRef.current = null;
        setActive(Math.round(position));
        setDragPosition(null);
        return;
      }

      momentumRef.current = window.requestAnimationFrame(move);
    };

    momentumRef.current = window.requestAnimationFrame(move);
  };

  const finishDrag = (event, commit) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (!drag.dragging) return;

    setIsDragging(false);
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);

    const velocity = event.timeStamp - drag.lastTime < 80 ? drag.velocity : 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!commit || reduceMotion || Math.abs(velocity) < MOMENTUM_MIN) {
      if (commit) setActive(Math.round(drag.position));
      setDragPosition(null);
      return;
    }

    startMomentum(drag.position, velocity);
  };

  const current = EVENTS[active];
  const position = dragPosition ?? active;

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
        className={`${styles.stage} ${dragPosition == null ? "" : styles.stageMoving} ${isDragging ? styles.stageDragging : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Event posters"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => finishDrag(event, true)}
        onPointerCancel={(event) => finishDrag(event, false)}
        onLostPointerCapture={(event) => finishDrag(event, false)}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className={`${styles.deck} ${entered ? styles.deckIn : ""}`}>
          {EVENTS.map((event, index) => {
            const distance = Math.abs(index - position);
            return (
              <button
                key={event.id}
                type="button"
                className={styles.card}
                style={cardStyle(index, position)}
                onClick={() => goTo(index)}
                data-event-card
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
                    style={{ opacity: 0.22 * Math.min(1, distance) }}
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
        <CarouselTicks
          active={active}
          position={position}
          moving={dragPosition != null}
          onSelect={goTo}
        />
      </div>
    </div>
  );
}
