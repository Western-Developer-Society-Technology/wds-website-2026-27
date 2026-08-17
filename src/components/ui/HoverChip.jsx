"use client";

import { forwardRef } from "react";
import styles from "./HoverChip.module.css";

const HoverChip = forwardRef(function HoverChip({ label, visible }, ref) {
  return (
    <div ref={ref} className={styles.chip} aria-hidden="true">
      <div
        className={`${styles.chipInner} ${visible ? styles.chipVisible : ""}`}
      >
        {label}
        <svg className={styles.chipArrow} viewBox="0 0 23 24" fill="none">
          <path
            d="M0.956243 22.5928L20.7556 1.30777M20.7558 22.5918L20.7556 1.30777L0.957322 1.30786"
            stroke="currentColor"
            strokeWidth="2.61566"
            strokeLinejoin="bevel"
          />
        </svg>
      </div>
    </div>
  );
});

export default HoverChip;
