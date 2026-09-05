"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 220;
const SWIPE_THRESHOLD = 40;
const DRAG_INTENT = 6;
const MOMENTUM_MIN = 0.00035;
const MOMENTUM_MAX = 0.008;
const MOMENTUM_FRICTION = 0.94;

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

// Drives a non-looping poster carousel: click/drag/wheel/swipe/arrow-key
// navigation over a fractional `position`, with pointer-drag momentum.
// `cardStep` is the pixel distance (at the stage's live rendered height)
// between adjacent slots — used to convert pointer movement into position.
export default function usePosterCarousel({
  count,
  initialActive = 0,
  cardStep,
  stageHeight,
}) {
  const last = count - 1;
  const [active, setActive] = useState(Math.min(last, Math.max(0, initialActive)));
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

  const cancelMomentum = useCallback(() => {
    if (momentumRef.current == null) return;
    window.cancelAnimationFrame(momentumRef.current);
    momentumRef.current = null;
  }, []);

  const goTo = useCallback(
    (index) => {
      cancelMomentum();
      setDragPosition(null);
      setActive(Math.min(last, Math.max(0, index)));
    },
    [cancelMomentum, last],
  );

  const step = useCallback(
    (dir) => {
      cancelMomentum();
      setDragPosition(null);
      setActive((current) => Math.min(last, Math.max(0, current + dir)));
    },
    [cancelMomentum, last],
  );

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
      step: Math.max(1, (event.currentTarget.clientHeight * cardStep) / stageHeight),
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
    drag.position = Math.min(last, Math.max(0, drag.startPosition - dx / drag.step));
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
      const bounded = Math.min(last, Math.max(0, next));
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

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const dx = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_THRESHOLD) step(-1);
    else if (dx < -SWIPE_THRESHOLD) step(1);
  };

  const onClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const position = dragPosition ?? active;

  return {
    active,
    position,
    isDragging,
    moving: dragPosition != null,
    atStart: active === 0,
    atEnd: active === last,
    goTo,
    step,
    rootRef,
    rootProps: { onTouchStart, onTouchEnd },
    stageProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => finishDrag(event, true),
      onPointerCancel: (event) => finishDrag(event, false),
      onLostPointerCapture: (event) => finishDrag(event, false),
      onClickCapture,
    },
  };
}
