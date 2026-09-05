import styles from "./PosterCarousel.module.css";

const TICK_PITCH = 14;

export default function CarouselTicks({ events, active, position, moving, onSelect }) {
  return (
    <div
      className={`${styles.ticks} ${moving ? styles.ticksMoving : ""}`}
      role="tablist"
      aria-label="Event slides"
    >
      <div
        className={styles.tickTrack}
        style={{
          transform: `translateX(calc(-${position} * ${TICK_PITCH}px - ${TICK_PITCH / 2}px))`,
        }}
      >
        {events.map((event, index) => {
          const distance = Math.abs(index - position);
          const height =
            distance <= 1 ? 60 - 29 * distance : Math.max(24, 38 - 7 * distance);
          const t = Math.max(0, 1 - distance);

          return (
            <button
              key={event.id}
              type="button"
              className={styles.tick}
              style={{
                "--tick-h": String(height),
                "--tick-t": String(t),
              }}
              aria-label={event.title}
              aria-current={index === active ? "true" : undefined}
              onClick={() => onSelect(index)}
            >
              <span className={styles.tickLine} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
