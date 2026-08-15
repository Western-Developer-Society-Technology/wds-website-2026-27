"use client";

import Image from "next/image";
import useReveal from "@/lib/useReveal";
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

export default function AboutCollage() {
  const [ref, revealed] = useReveal({
    rootMargin: "0px 0px -65% 0px",
  });

  return (
    <div
      ref={ref}
      className={`${styles.collage} ${revealed ? styles.revealed : ""}`}
    >
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
