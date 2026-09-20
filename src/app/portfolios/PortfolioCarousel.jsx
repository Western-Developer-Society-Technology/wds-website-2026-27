"use client";

import { useEffect } from "react";
import Image from "next/image";
import useReveal from "@/lib/useReveal";
import usePosterCarousel from "@/lib/usePosterCarousel";
import ArrowButton from "@/components/ui/ArrowButton";
import styles from "./PortfolioCarousel.module.css";

// Same left-locked carousel as upcoming events: the focused card is pinned
// to the content column's left edge, and the rest fan out to the right
// (already-passed cards tuck into the left gutter). Geometry is in the
// same 1512-wide unit space. Unlike the events posters, these tiles never
// skew or drop — only scale, so the selected tile is large and the others
// stay small.
const BASE = 160;
const FOCUS = 230;
const GAP = 40;
const STEP_1 = FOCUS + GAP;
const STEP_N = BASE + GAP;
const LEFT_FIRST_GAP = BASE + GAP;
const FOCUS_SCALE = FOCUS / BASE;
const REST_SCALE = 1;
const STAGE_HEIGHT = FOCUS;

const ENTER_THRESHOLD = 0.2;
const ENTER_ROOT_MARGIN = "0px 0px -28% 0px";

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
  const scale = REST_SCALE + (FOCUS_SCALE - REST_SCALE) * Math.max(0, 1 - distance);
  const layerSlot = index - Math.round(position);

  return {
    transform: `translate3d(calc(${x} * var(--upx)), 0, 0) scale(${scale})`,
    zIndex: layerSlot === 0 ? 30 : 20 - layerSlot,
  };
}

export default function PortfolioCarousel({ portfolios, onActiveChange }) {
  const { active, position, isDragging, moving, atStart, atEnd, onCardActivate, step, rootRef, rootProps, stageProps } =
    usePosterCarousel({
      count: portfolios.length,
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
        aria-label="Portfolios"
        tabIndex={0}
        {...stageProps}
      >
        <div className={`${styles.deck} ${entered ? styles.deckIn : ""}`}>
          {portfolios.map((portfolio, index) => (
            <button
              key={portfolio.id}
              id={`portfolio-tab-${portfolio.id}`}
              type="button"
              className={styles.card}
              style={cardStyle(index, position)}
              onClick={() => onCardActivate(index)}
              data-event-card
              data-index={index}
              aria-label={portfolio.label}
              aria-current={index === active ? "true" : undefined}
              aria-controls="portfolio-details"
            >
              <Image
                src={portfolio.src}
                width={portfolio.w}
                height={portfolio.h}
                alt=""
              />
              <span>{portfolio.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.fade} aria-hidden="true" />
      </div>

      <div className={styles.controls}>
        <ArrowButton
          direction="prev"
          className={styles.navControlButton}
          onClick={() => step(-1)}
          disabled={atStart}
          ariaLabel="Previous portfolio"
        />
        <ArrowButton
          direction="next"
          className={styles.navControlButton}
          onClick={() => step(1)}
          disabled={atEnd}
          ariaLabel="Next portfolio"
        />
      </div>
    </div>
  );
}
