"use client";

import { useEffect } from "react";
import Image from "next/image";
import useReveal from "@/lib/useReveal";
import usePosterCarousel from "@/lib/usePosterCarousel";
import CarouselTicks from "./CarouselTicks";
import styles from "./PosterCarousel.module.css";

const CARD_STEP = 500;
const STAGE_HEIGHT = 740;

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

// The home page's "our events" carousel, extracted into a themeable,
// data-driven component so the events page can reuse it verbatim (light)
// for the home section and (dark) for the previous-events section.
export default function PosterCarousel({
  events,
  initialActive = 0,
  theme = "light",
  size = "default",
  showCaption = true,
  showTicks = true,
  onActiveChange,
}) {
  const {
    active,
    position,
    isDragging,
    moving,
    goTo,
    rootRef,
    rootProps,
    stageProps,
  } = usePosterCarousel({
    count: events.length,
    initialActive,
    cardStep: CARD_STEP,
    stageHeight: STAGE_HEIGHT,
  });
  const [stageRef, entered] = useReveal({
    threshold: ENTER_THRESHOLD,
    rootMargin: ENTER_ROOT_MARGIN,
  });

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const current = events[active];

  return (
    <div ref={rootRef} className={styles.bleed} data-theme={theme} data-size={size} {...rootProps}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${moving ? styles.stageMoving : ""} ${isDragging ? styles.stageDragging : ""}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Event posters"
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

      {showCaption && (
        <div
          key={active}
          className={`${styles.caption} ${entered ? `${styles.metaIn} ${styles.captionEnter}` : ""}`}
          aria-live="polite"
        >
          <p className={styles.title}>{current.title}</p>
          <p className={styles.date}>{current.date}</p>
        </div>
      )}

      {showTicks && (
        <div className={`${styles.ticksWrap} ${entered ? styles.metaIn : ""}`}>
          <CarouselTicks
            events={events}
            active={active}
            position={position}
            moving={moving}
            onSelect={goTo}
          />
        </div>
      )}
    </div>
  );
}
