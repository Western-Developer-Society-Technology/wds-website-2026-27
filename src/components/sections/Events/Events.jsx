import Barcode from "@/components/ui/Barcode";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { events } from "@/data/events";
import EventCard from "./EventCard";
import CarouselProgress from "./CarouselProgress";
import styles from "./Events.module.css";

/**
 * Events — design frame y 2411 → 3597. The first white section.
 *
 * The card row deliberately overflows the right edge: in the design a third
 * card is half off-canvas, which is what signals the row scrolls. So the track
 * is a scroller that starts at the gutter and runs past the frame, not a
 * contained grid.
 */
export default function Events() {
  return (
    <section id="events" className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          className={styles.heading}
          title="our events"
          superscript="24-25"
          action={
            <Button href="#events" variant="ink" size="sm">
              view all
            </Button>
          }
        />

        <div className={styles.track}>
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>

        <CarouselProgress className={styles.progress} count={events.length} />
      </div>

      <div className={styles.divider}>
        <Barcode
          orientation="vertical"
          bars={67}
          seed={23}
          gap={5}
          minBar={7}
          maxBar={38}
        />
      </div>
    </section>
  );
}
