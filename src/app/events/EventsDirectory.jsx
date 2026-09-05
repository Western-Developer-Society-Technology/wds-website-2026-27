"use client";

import { useState } from "react";
import PosterCarousel from "@/components/ui/PosterCarousel/PosterCarousel";
import UpcomingCarousel from "@/components/ui/UpcomingCarousel/UpcomingCarousel";
import EventDetailCard from "@/components/ui/DetailCard/EventDetailCard";
import { UPCOMING_EVENTS, PAST_EVENTS } from "@/components/sections/Events/eventData";
import styles from "./events.module.css";

export default function EventsDirectory() {
  const [upcomingActive, setUpcomingActive] = useState(0);
  const [previousActive, setPreviousActive] = useState(() =>
    Math.floor((PAST_EVENTS.length - 1) / 2),
  );

  const upcomingEvent = UPCOMING_EVENTS[upcomingActive];
  const previousEvent = PAST_EVENTS[previousActive];

  return (
    <>
      <section className={styles.upcoming} aria-label="Upcoming events">
        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.label}>upcoming</p>
            <div className={styles.headingGroup}>
              <h1 className={styles.heading}>events</h1>
              <span className={styles.year}>26-27</span>
            </div>
          </div>
        </div>

        <UpcomingCarousel events={UPCOMING_EVENTS} onActiveChange={setUpcomingActive} />

        <div className={styles.inner}>
          <EventDetailCard
            event={upcomingEvent}
            theme="light"
            action={{ label: "rsvp", onClick: () => {} }}
          />
        </div>
      </section>

      <section className={styles.previous} aria-label="Previous events">
        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.label}>previous</p>
            <div className={styles.headingGroup}>
              <h2 className={styles.heading}>events</h2>
              <span className={styles.year}>25-26</span>
            </div>
          </div>
        </div>

        <PosterCarousel
          events={PAST_EVENTS}
          initialActive={Math.floor((PAST_EVENTS.length - 1) / 2)}
          theme="dark"
          showCaption={false}
          onActiveChange={setPreviousActive}
        />

        <div className={styles.inner}>
          <EventDetailCard event={previousEvent} theme="dark" />
        </div>
      </section>
    </>
  );
}
