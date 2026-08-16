import { EVENTS } from "./eventData";
import styles from "./Events.module.css";

const TICK_PITCH = 14;

export default function CarouselTicks({ active, onSelect }) {
  return (
    <div className={styles.ticks} role="tablist" aria-label="Event slides">
      <div
        className={styles.tickTrack}
        style={{
          transform: `translateX(calc(-${active} * ${TICK_PITCH}px - ${TICK_PITCH / 2}px))`,
        }}
      >
        {EVENTS.map((event, index) => {
          const distance = Math.abs(index - active);
          const height = distance === 0 ? 60 : distance === 1 ? 31 : 24;
          const color = distance === 0 ? "#252525" : "#CECECE";

          return (
            <button
              key={event.id}
              type="button"
              className={styles.tick}
              style={{ "--tick-h": String(height), "--tick-c": color }}
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
