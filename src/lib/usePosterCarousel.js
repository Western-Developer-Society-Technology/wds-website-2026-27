"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 220;
const SWIPE_THRESHOLD = 40;
const DRAG_INTENT = 6;

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
// navigation over a fractional `position`. A drag follows the pointer
// continuously while held — free to cross as many cards as the drag
// distance covers — and `active` (the "current card") tracks live to
// whichever card is nearest as you go, not just once you let go. Releasing
// simply settles on whichever card is nearest at that point.
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
  const suppressClickRef = useRef(false);
  const [dragPosition, setDragPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback(
    (index) => {
      setDragPosition(null);
      setActive(Math.min(last, Math.max(0, index)));
    },
    [last],
  );

  const step = useCallback(
    (dir) => {
      setDragPosition(null);
      setActive((current) => Math.min(last, Math.max(0, current + dir)));
    },
    [last],
  );

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

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPosition: dragPosition ?? active,
      position: dragPosition ?? active,
      step: Math.max(1, (event.currentTarget.clientHeight * cardStep) / stageHeight),
      cardIndex: Number(card.dataset.index),
      dragging: false,
    };
    card.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    if (!drag.dragging && Math.abs(dx) < DRAG_INTENT) return;

    if (!drag.dragging) setIsDragging(true);
    drag.dragging = true;
    drag.position = Math.min(last, Math.max(0, drag.startPosition - dx / drag.step));
    setDragPosition(drag.position);
    // Live-track whichever card is nearest as the drag crosses it — the
    // caption/detail-card/etc. that read `active` update in real time, not
    // just once the pointer is released. React bails out of the re-render
    // on its own when this doesn't actually change.
    setActive(Math.min(last, Math.max(0, Math.round(drag.position))));
    event.preventDefault();
  };

  const finishDrag = (event, commit) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;

    // Every mouse interaction that reaches here — plain click or real drag
    // — is resolved right here, authoritatively. We don't lean on the
    // browser's own trailing "click" event at all: with setPointerCapture,
    // browsers are inconsistent about whether that click gets retargeted
    // back to the *original* card, which (if acted on) would silently
    // revert a drag that just correctly landed somewhere else. Suppressing
    // it for a beat covers that stray click regardless of why it fires.
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 400);

    if (!drag.dragging) {
      if (commit) goTo(drag.cardIndex);
      return;
    }

    setIsDragging(false);

    // Settle on whichever card is nearest wherever the drag ends up —
    // could be any number of cards from where it started, or (on a
    // canceled drag) simply wherever it already was.
    const finalPosition = commit
      ? Math.min(last, Math.max(0, drag.startPosition - (event.clientX - drag.startX) / drag.step))
      : drag.startPosition;

    setActive(Math.min(last, Math.max(0, Math.round(finalPosition))));
    setDragPosition(null);
  };

  // Components call this from a card's onClick instead of `goTo` directly.
  // Keyboard-triggered activation (Enter/Space) reaches a button's onClick
  // with no preceding pointer sequence at all, so suppressClickRef is never
  // set for it and it passes straight through; touch taps never set
  // dragRef (pointerdown bails out for non-mouse pointers above) so they
  // pass through too. Only a mouse click we've already handled ourselves
  // in finishDrag gets ignored here.
  const onCardActivate = (index) => {
    if (suppressClickRef.current) return;
    goTo(index);
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
    onCardActivate,
    rootRef,
    rootProps: { onTouchStart, onTouchEnd },
    stageProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => finishDrag(event, true),
      onPointerCancel: (event) => finishDrag(event, false),
      onLostPointerCapture: (event) => finishDrag(event, false),
    },
  };
}
