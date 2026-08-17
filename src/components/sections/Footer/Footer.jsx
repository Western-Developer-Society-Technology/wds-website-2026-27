"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Barcode from "@/components/ui/Barcode";
import HoverChip from "@/components/ui/HoverChip";
import useReveal from "@/lib/useReveal";
import { socials } from "./socialData";
import styles from "./Footer.module.css";

const LETTER_ADVANCE = { w: 0.714, d: 0.523, s: 0.472 };
const BARCODE_COUNT = 12;
const WORDMARK = "wds".repeat(4);

function unit(index, count) {
  return count <= 1 ? "0" : String(index / (count - 1));
}

export default function Footer({ variant = "page" }) {
  const [activeLabel, setActiveLabel] = useState("");
  const chipRef = useRef(null);
  const [warpRef, warped] = useReveal({
    rootMargin: "0px 0px -18% 0px",
  });

  const onPointerMove = useCallback((event) => {
    if (event.pointerType !== "mouse") {
      setActiveLabel("");
      return;
    }

    const target = event.target.closest("[data-social]");
    const label = target?.dataset.social ?? "";
    setActiveLabel(label);

    if (label && chipRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      chipRef.current.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0) translate(-50%, -50%)`;
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    setActiveLabel("");
  }, []);

  return (
    <footer
      ref={warpRef}
      className={`${styles.footer} ${variant === "overlay" ? styles.overlay : ""}`}
      aria-label="Footer"
      data-variant={variant}
      data-warp={warped ? "on" : "off"}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <p className={styles.org}>western developers society</p>

      {socials.map((social) => (
        <a
          key={social.id}
          className={styles.social}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          data-social={social.label}
          data-id={social.id}
          style={{ left: `calc(${social.x} * var(--fpx))` }}
        >
          <span className={styles.socialIcon}>
            <Image
              src={`/icons/social/${social.id}.svg`}
              alt=""
              fill
              unoptimized
              sizes="36px"
              className={styles.socialImg}
            />
          </span>
        </a>
      ))}

      <div className={styles.strip} aria-hidden="true">
        <div className={styles.stripTrack}>
          {Array.from({ length: BARCODE_COUNT }, (_, i) => (
            <div
              key={i}
              className={styles.segment}
              style={{ "--t": unit(i, BARCODE_COUNT) }}
            >
              <Barcode
                orientation="vertical"
                color="var(--blue)"
                reverse={i % 6 === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        <p className={styles.wordmarkRow}>
          {[...WORDMARK].map((letter, i) => (
            <span
              key={i}
              className={`${styles.letter} ${i >= 9 ? styles.letterExtra : ""}`}
              style={{
                "--i": String(i),
                "--advance": `${LETTER_ADVANCE[letter]}em`,
              }}
            >
              <span className={styles.glyph}>{letter}</span>
            </span>
          ))}
        </p>
      </div>

      <HoverChip
        ref={chipRef}
        label={activeLabel}
        visible={Boolean(activeLabel)}
      />
    </footer>
  );
}
