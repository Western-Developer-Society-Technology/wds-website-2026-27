"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import PosterCarousel from "@/components/ui/PosterCarousel/PosterCarousel";
import EventDetailCard from "@/components/ui/DetailCard/EventDetailCard";
import { PAST_EVENTS } from "@/components/sections/Events/eventData";
import TiltPoster from "./TiltPoster";
import styles from "./events.module.css";

function LumaStar() {
  return (
    <svg className={styles.lumaStar} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C12 6.63 6.63 12 0 12c6.63 0 12 5.37 12 12 0-6.63 5.37-12 12-12C17.37 12 12 6.63 12 0Z" />
    </svg>
  );
}

function GuestPreview({ guests }) {
  if (!guests?.count) return null;

  const roundedCount = Math.round(guests.count / 5) * 5;

  return (
    <div className={styles.guestPreview} role="group" aria-label="Who's going">
      {guests.preview?.length > 0 && <ul className={styles.guestAvatars} aria-label="Attendee preview">
        {guests.preview.slice(0, 4).map((guest) => (
          <li
            key={guest.id}
            className={styles.guestAvatar}
            title={guest.name}
          >
            <span className={styles.srOnly}>{guest.name}</span>
            {guest.avatarUrl ? (
              <Image src={guest.avatarUrl} alt="" width={32} height={32} unoptimized className={styles.guestPortrait} />
            ) : (
              <span aria-hidden="true">{guest.initials}</span>
            )}
          </li>
        ))}
      </ul>}
      <p className={styles.guestCount}>{roundedCount}+ going</p>
    </div>
  );
}

function EventArrow({ direction, disabled, onClick }) {
  return (
    <button
      type="button"
      className={styles.eventArrow}
      data-direction={direction}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${direction === "prev" ? "Previous" : "Next"} upcoming event`}
      aria-controls="upcoming-event-slides"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h16m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function EventsDirectory({ upcomingEvents = [] }) {
  const [upcomingActive, setUpcomingActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const [previousActive, setPreviousActive] = useState(() =>
    Math.floor((PAST_EVENTS.length - 1) / 2),
  );

  const activeIndex = Math.min(upcomingActive, Math.max(0, upcomingEvents.length - 1));
  const upcomingEvent = upcomingEvents[activeIndex];
  const previousEvent = PAST_EVENTS[previousActive];

  function stepEvent(step) {
    setUpcomingActive(Math.max(0, Math.min(upcomingEvents.length - 1, activeIndex + step)));
  }

  return (
    <>
      <section
        className={styles.upcoming}
        aria-label="Upcoming events"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          event.preventDefault();
          stepEvent(event.key === "ArrowLeft" ? -1 : 1);
        }}
      >
        <div className={styles.inner}>
          <div className={`${styles.head} ${styles.upcomingHead}`}>
            <div>
              <p className={styles.label}>upcoming</p>
              <div className={styles.headingGroup}>
                <h1 className={styles.heading}>events</h1>
                <span className={styles.year}>26-27</span>
              </div>
            </div>
            {upcomingEvents.length > 1 && (
              <div className={styles.eventNavigation}>
                <span className={styles.eventCount} aria-hidden="true">
                  {activeIndex + 1} / {upcomingEvents.length}
                </span>
                <EventArrow direction="prev" disabled={activeIndex === 0} onClick={() => stepEvent(-1)} />
                <EventArrow direction="next" disabled={activeIndex === upcomingEvents.length - 1} onClick={() => stepEvent(1)} />
              </div>
            )}
          </div>

          {upcomingEvent ? <div
            className={styles.carousel}
            role="region"
            aria-roledescription="carousel"
            aria-label="Upcoming event details"
          >
            <div className={styles.slideViewport}>
              <motion.div
                id="upcoming-event-slides"
                className={styles.slideTrack}
                animate={{ x: `${-activeIndex * 100}%` }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {upcomingEvents.map((event, index) => (
                  <article
                    key={event.id}
                    className={styles.feature}
                    aria-labelledby={`event-title-${event.id}`}
                    aria-roledescription="slide"
                    aria-hidden={index !== activeIndex}
                    inert={index !== activeIndex}
                  >
                    <figure className={styles.poster}>
                      <TiltPoster event={event} priority={index === 0} active={index === activeIndex} />
                    </figure>

                    <div className={styles.eventIntro}>
                      <p className={styles.eventEyebrow}>{index === 0 ? "next event" : "coming up"}</p>
                      <h2 id={`event-title-${event.id}`} className={styles.eventTitle}>{event.title}</h2>
                      <dl className={styles.eventMeta}>
                        <div>
                          <dt className={styles.srOnly}>Date and time</dt>
                          <dd className={styles.eventDate}>
                            <span>{event.date}</span>
                            <span className={styles.metaSeparator} aria-hidden="true">·</span>
                            <span>{event.time || "Time to be announced"}</span>
                          </dd>
                        </div>
                        <div>
                          <dt className={styles.srOnly}>Location</dt>
                          <dd>{event.location || "Location to be announced"}</dd>
                        </div>
                      </dl>
                    </div>

                    <p className={styles.eventSummary}>{event.description ?? event.body?.join(" ")}</p>

                    <div className={styles.eventControls}>
                      <a
                        className={styles.rsvp}
                        href={event.rsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`RSVP on Luma for ${event.title} (opens in a new tab)`}
                      >
                        rsvp on luma <LumaStar />
                      </a>
                      <GuestPreview guests={event.guests} />
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
            <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
              Event {activeIndex + 1} of {upcomingEvents.length}: {upcomingEvent.title}
            </p>
          </div> : <div className={`${styles.carousel} ${styles.emptyState}`}>
            <h2>No upcoming events announced yet.</h2>
            <p>Check back soon for our next meetup.</p>
          </div>}
        </div>
      </section>

      <section className={styles.previous} aria-label="Previous events" data-nav-on-dark="">
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
