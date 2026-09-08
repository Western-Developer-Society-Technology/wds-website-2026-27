"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ArrowButton from "@/components/ui/ArrowButton";
import { socials } from "@/components/sections/Footer/socialData";
import styles from "./hackathon-team.module.css";

const posters = [
  { title: "Hack the North", src: "hack-the-north", event: "north" },
  { title: "Hack the Valley 11", src: "hack-the-valley", event: "valley" },
  { title: "Hack Western 13", src: "hack-western", event: "western" },
  { title: "Hack the Valley", src: "forest-poster", event: "valley" },
  { title: "Hack the Valley", src: "forest-poster", event: "valley" },
  { title: "Hack the Valley", src: "forest-poster", event: "valley" },
];

const photos = [
  { src: "north-announcement", alt: "Hack the North is back announcement", width: 165 },
  { src: "north-group", alt: "Hack the North participants posing together", width: 309 },
  { src: "north-collage", alt: "A collage of Hack the North highlights", width: 166 },
  { src: "north-community", alt: "The Hack the North community", width: 310 },
];

function HackathonGallery() {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const track = trackRef.current;
    const updateEdges = () => {
      setEdges({
        start: track.scrollLeft <= 2,
        end: track.scrollLeft >= track.scrollWidth - track.clientWidth - 2,
      });
    };
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    track.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateEdges);
    };
  }, []);

  const scroll = (direction) => {
    const track = trackRef.current;
    const step = track.firstElementChild.getBoundingClientRect().width + 18;
    track.scrollBy({ left: direction * step });
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryViewport}>
        <div
          ref={trackRef}
          className={styles.photoTrack}
          tabIndex={0}
          role="region"
          aria-label="Hack the North photos"
        >
          {photos.map((photo) => (
            <Image
              key={photo.src}
              src={`/images/hackathon-team/${photo.src}.webp`}
              alt={photo.alt}
              width={photo.width}
              height={207}
              sizes="(max-width: 600px) 75vw, 310px"
              className={styles.galleryPhoto}
              style={{ aspectRatio: `${photo.width} / 207` }}
            />
          ))}
        </div>
      </div>
      <div className={styles.galleryControls}>
        <ArrowButton direction="prev" onClick={() => scroll(-1)} disabled={edges.start} ariaLabel="Previous photo" />
        <ArrowButton onClick={() => scroll(1)} disabled={edges.end} ariaLabel="Next photo" />
      </div>
    </div>
  );
}

export default function HackathonDirectory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const tabRefs = useRef([]);
  const active = posters[activeIndex];
  const isNorth = active.event === "north";
  const discord = socials.find((link) => link.id === "discord");

  useEffect(() => {
    const track = trackRef.current;
    const tab = tabRefs.current[activeIndex];
    track.scrollTo({ left: tab.offsetLeft - tabRefs.current[0].offsetLeft });
  }, [activeIndex]);

  const handleKeyDown = (event) => {
    let next = activeIndex;
    if (event.key === "ArrowRight") next = Math.min(posters.length - 1, activeIndex + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, activeIndex - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = posters.length - 1;
    else return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next].focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="hackathon-heading">
      <div className={styles.carousel}>
        <div ref={trackRef} className={styles.posterTrack} role="tablist" aria-label="Upcoming hackathons">
          {posters.map((poster, index) => (
            <button
              key={`${poster.src}-${index}`}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`hackathon-tab-${index}`}
              type="button"
              role="tab"
              aria-label={poster.title}
              aria-selected={index === activeIndex}
              aria-controls="hackathon-details"
              tabIndex={index === activeIndex ? 0 : -1}
              className={styles.poster}
              onClick={() => setActiveIndex(index)}
              onKeyDown={handleKeyDown}
            >
              <Image
                src={`/images/hackathon-team/${poster.src}.webp`}
                alt=""
                fill
                sizes="(max-width: 600px) 60vw, 275px"
                preload={index === 0}
                draggable={false}
              />
            </button>
          ))}
        </div>
        <div className={styles.posterControls}>
          <ArrowButton direction="prev" onClick={() => setActiveIndex(activeIndex - 1)} disabled={activeIndex === 0} ariaLabel="Previous hackathon" />
          <ArrowButton onClick={() => setActiveIndex(activeIndex + 1)} disabled={activeIndex === posters.length - 1} ariaLabel="Next hackathon" />
        </div>
      </div>

      <article
        className={styles.details}
        id="hackathon-details"
        role="tabpanel"
        aria-labelledby={`hackathon-tab-${activeIndex}`}
        tabIndex={0}
      >
        <div className={styles.eventSummary}>
          <p className={styles.date}>{isNorth ? "September 18-20, 2026" : "Details coming soon"}</p>
          <h2 className={styles.eventTitle}>{active.title}</h2>
          {isNorth && (
            <>
              <div className={styles.pills} aria-label="Event details">
                <span>Waterloo, ON, CA</span>
                <span>In-Person</span>
              </div>
              <HackathonGallery />
            </>
          )}
        </div>
        <div className={styles.eventContent}>
          <div className={styles.eventCopy}>
            {isNorth ? (
              <>
                <p>
                  Welcome to Canada&apos;s biggest hackathon<br />
                  This September, join 1,000+ hackers from around the world and
                  build with people who think differently. Learn from world-class
                  mentors, connect with the community, and turn ideas into
                  something real. 13 years in, Hack the North continues to bring
                  hands-on workshops, unforgettable experiences, and real
                  connections with the companies shaping what&apos;s next in tech.
                </p>
                <p>
                  Not from Waterloo? We cover food, help with travel expenses,
                  and provide lodging so you can focus on turning your dreams
                  into reality.
                </p>
              </>
            ) : (
              <p>More details coming soon. Connect with the WDS community for hackathon and team updates.</p>
            )}
          </div>
          <div className={styles.actions}>
            <a href={discord.href} target="_blank" rel="noopener noreferrer" className={styles.join}>
              {isNorth ? "join a team" : "join our community"}
              <span className={styles.srOnly}> on Discord (opens in a new tab)</span>
            </a>
            {isNorth && <button type="button" className={styles.closed} disabled>applications closed</button>}
          </div>
        </div>
      </article>
    </section>
  );
}
