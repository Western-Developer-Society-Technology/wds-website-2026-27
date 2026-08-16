"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./About.module.css";

const PHOTOS = [
  {
    id: "photo1",
    src: "/images/about/photo1.png",
    alt: "WDS members at a tech mixer",
    className: styles.photo1,
  },
  {
    id: "photo2",
    src: "/images/about/photo2.png",
    alt: "Students smiling and throwing up the W",
    className: styles.photo2,
  },
  {
    id: "photo3",
    src: "/images/about/photo3.png",
    alt: "Audience watching a Spark 2026 recap presentation",
    className: styles.photo3,
  },
  {
    id: "photo4",
    src: "/images/about/photo4.png",
    alt: "Members holding gold WDS balloons",
    className: styles.photo4,
  },
  {
    id: "photo5",
    src: "/images/about/photo5.png",
    alt: "Casino-themed event table with cards and chips",
    className: styles.photo5,
  },
];

const SMOOTH = 0.14;
const START_VH = 0.72;
const START_VH_MOBILE = 1.1;
const END_VH = 0.16;
const END_VH_MOBILE = 0.7;

export default function AboutCollage() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let frame = 0;

    const mobile = window.matchMedia("(max-width: 768px)");

    const progressFromScroll = () => {
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight || 1;
      const start = vh * (mobile.matches ? START_VH_MOBILE : START_VH);
      const end = vh * (mobile.matches ? END_VH_MOBILE : END_VH);
      return Math.min(1, Math.max(0, (start - top) / (start - end)));
    };

    const apply = (value) => {
      el.style.setProperty("--collage-p", value.toFixed(4));
    };

    const tick = () => {
      current += (target - current) * SMOOTH;
      if (Math.abs(target - current) < 0.001) current = target;
      apply(current);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const sync = (immediate = false) => {
      if (media.matches) {
        current = 1;
        target = 1;
        apply(1);
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        return;
      }

      target = progressFromScroll();
      if (immediate) {
        current = target;
        apply(current);
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => sync();
    const onResize = () => sync(true);
    const onMotion = () => sync(true);

    sync(true);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    media.addEventListener("change", onMotion);
    mobile.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", onMotion);
      mobile.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={styles.collage}>
      {PHOTOS.map((photo) => (
        <div key={photo.id} className={`${styles.photo} ${photo.className}`}>
          <div className={styles.photoClip} style={{ position: "absolute" }}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, min(1200px, calc(100vw - 120px))"
              className={styles.photoImg}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
