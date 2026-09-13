"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./ApplicationProgress.module.css";

gsap.registerPlugin(useGSAP);

// One continuous stroke, running from the w to the tail of the s.
const LOOPED_PATH = `
  M16 38 C22 30 26 22 27 19
  C24 34 18 59 25 66 C34 78 45 50 49 28
  C45 44 42 63 48 69 C60 78 74 51 75 31
  C76 20 69 19 68 28 C66 38 76 43 84 34
  C91 61 69 85 49 111 C32 132 30 150 49 158
  C36 153 23 165 22 185 C19 205 26 216 38 212
  C55 204 69 164 76 130 C83 93 72 91 64 120
  C53 153 45 197 54 210 C59 218 71 210 82 198
  C88 219 79 235 63 252 C54 244 35 251 31 264
  C26 279 46 284 58 291 C78 303 63 328 46 329
  C30 331 20 320 25 311 C29 304 37 310 43 315
  C55 325 70 320 84 308
`;

export default function ApplicationProgress({ completed, total }) {
  const fill = useRef(null);
  const ratio = total ? Math.min(1, Math.max(0, completed / total)) : 1;

  useGSAP(() => {
    const path = fill.current;
    const length = path.getTotalLength();
    const measure = () => {
      const matrix = path.getScreenCTM();
      if (!matrix) return;
      // Non-scaling strokes also keep dash lengths in screen pixels. Match the
      // rendered curve length so resizing never changes the filled proportion.
      const scale = Math.hypot(matrix.a, matrix.b);
      path.style.setProperty("--path-length", `${length * scale}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(path.ownerSVGElement);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const path = fill.current;
    if (ratio > 0) gsap.set(path, { attr: { opacity: 1 } });

    // A negative dash offset reveals the end of the path first: s → d → w.
    // Continue from the current position, including when an answer is cleared.
    gsap.to(path, {
      "--progress": ratio,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.8,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        // Hide the rounded end cap only after the last bit has retracted.
        if (ratio === 0) path.setAttribute("opacity", "0");
      },
    });
  }, { dependencies: [ratio] });

  return (
    <aside className={styles.dock} aria-label="Application completion">
      <div
        className={styles.progressMark}
        role="progressbar"
        aria-label="Application progress"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${completed} of ${total} required answers completed`}
      >
        <svg className={styles.lettering} viewBox="0 0 100 350" aria-hidden="true">
          <path d={LOOPED_PATH} vectorEffect="non-scaling-stroke" />
          <path
            ref={fill}
            className={styles.letteringFill}
            d={LOOPED_PATH}
            opacity="0"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className={styles.progressCount} aria-hidden="true">{completed} / {total}</span>
      </div>
    </aside>
  );
}
