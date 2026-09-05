"use client";

import { useEffect } from "react";
import Image from "next/image";
import useReveal from "@/lib/useReveal";
import usePosterCarousel from "@/lib/usePosterCarousel";
import ArrowButton from "@/components/ui/ArrowButton";
import styles from "./UpcomingCarousel.module.css";

// Card geometry derived from the Figma "Top Section" frame (1512 wide):
// the focused poster is anchored to the content column's left edge and
// unfocused posters fan out to the right at a shrinking scale. Unlike the
// home/previous carousel, this one never loops — index 0 is always the
// soonest event and sits flush left.
const STEP_1 = 379.7;
const STEP_N = 149.6;
const SKEW = 15.7;
const FOCUS_SCALE = 1.2;
const REST_SCALE = 0.825;
const REST_NUDGE = -64;
const BASE_W = 289.87;
const STAGE_HEIGHT = 450;

// Distance (in the same 1512-wide unit space as everything else here) from
// the focused card to the single nearest unfocused card on its left. Tune
// this directly to open up or close that one gap — it's independent of
// STEP_N, which controls the tighter pitch between the *rest* of the
// left-side (already-passed) cards.
const LEFT_FIRST_GAP = 270;

const ENTER_THRESHOLD = 0.2;
const ENTER_ROOT_MARGIN = "0px 0px -28% 0px";

// Cards ahead of the focus (not yet seen) fan out at the same pitch as the
// home carousel. Cards behind the focus (already passed) have nowhere to
// fan into — the focused poster is pinned to the content edge — so they
// use a tighter, uniform pitch instead of the wider first step, except for
// the immediate left neighbor, which gets its own configurable gap.
function slotX(slot) {
  if (slot >= 0) {
    if (slot <= 1) return slot * STEP_1;
    return STEP_1 + (slot - 1) * STEP_N;
  }
  if (slot === -1) return -LEFT_FIRST_GAP;
  return -(LEFT_FIRST_GAP + (Math.abs(slot) - 1) * STEP_N);
}

function cardStyle(index, position) {
  const slot = index - position;
  const distance = Math.abs(slot);
  const x = slotX(slot);
  const nudge = REST_NUDGE * Math.min(1, distance);
  const skewY = SKEW * Math.min(1, distance);
  const scale = REST_SCALE + (FOCUS_SCALE - REST_SCALE) * Math.max(0, 1 - distance);
  const layerSlot = index - Math.round(position);

  return {
    transform: `translate3d(calc(${x} * var(--upx)), calc(${nudge} * var(--upx)), 0) skewY(${skewY}deg) scale(${scale})`,
    zIndex: layerSlot === 0 ? 30 : 20 - layerSlot,
  };
}

export default function UpcomingCarousel({ events, onActiveChange }) {
  const { active, position, isDragging, moving, atStart, atEnd, goTo, step, rootRef, rootProps, stageProps } =
    usePosterCarousel({
      count: events.length,
      initialActive: 0,
      cardStep: STEP_1,
      stageHeight: STAGE_HEIGHT,
    });
  const [stageRef, entered] = useReveal({
    threshold: ENTER_THRESHOLD,
    rootMargin: ENTER_ROOT_MARGIN,
  });

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  return (
    <div ref={rootRef} className={styles.bleed} {...rootProps}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${moving ? styles.stageMoving : ""} ${isDragging ? styles.stageDragging : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Upcoming event posters"
        tabIndex={0}
        {...stageProps}
      >
        <div className={`${styles.deck} ${entered ? styles.deckIn : ""}`}>
          {events.map((event, index) => {
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
                    sizes="(max-width: 768px) 70vw, 25vw"
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
        <div className={styles.fade} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <ArrowButton direction="prev" onClick={() => step(-1)} disabled={atStart} ariaLabel="Previous event" />
        <ArrowButton direction="next" onClick={() => step(1)} disabled={atEnd} ariaLabel="Next event" />
      </div>
    </div>
  );
}
