"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ArrowButton from "@/components/ui/ArrowButton";
import styles from "./DetailCard.module.css";

// A horizontally scrollable photo strip: freely draggable/scrollable by
// touch or trackpad, and also steppable one photo at a time with arrows.
export default function PhotoStrip({ photos, theme }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(photos.length <= 1);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [updateEdges, photos]);

  const scrollByPhoto = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[0];
    const gap = 18;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.5;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={styles.stripWrap}>
      <div ref={trackRef} className={styles.strip} onScroll={updateEdges}>
        {photos.map((photo, index) => (
          <div
            key={index}
            className={styles.photo}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <Image
              src={photo.src}
              alt={photo.alt ?? ""}
              fill
              sizes="(max-width: 768px) 45vw, 310px"
              className={styles.photoImg}
            />
          </div>
        ))}
      </div>
      <span className={`${styles.stripFade} ${styles.stripFadeLeft}`} aria-hidden="true" />
      <span className={`${styles.stripFade} ${styles.stripFadeRight}`} aria-hidden="true" />
      <div className={styles.stripControls}>
        <ArrowButton
          direction="prev"
          theme={theme}
          onClick={() => scrollByPhoto(-1)}
          disabled={atStart}
          ariaLabel="Previous photo"
        />
        <ArrowButton
          direction="next"
          theme={theme}
          onClick={() => scrollByPhoto(1)}
          disabled={atEnd}
          ariaLabel="Next photo"
        />
      </div>
    </div>
  );
}
