"use client";

import { useEffect, useState } from "react";
import MenuOverlay from "./MenuOverlay";
import {
  COL_COUNT,
  COL_DUR,
  COL_STAGGER,
  CONTENT_FADE,
  EASE,
  WDS_LETTER_COUNT,
  WDS_LETTER_DURATION,
  WDS_LETTER_EASE,
  WDS_LETTER_FROM,
  WDS_LETTER_STAGGER,
} from "./timing";
import styles from "./Curtain.module.css";

const LETTERS = ["w", "d", "s"];

export default function Curtain({
  covered,
  contentVisible,
  wdsMode,
  showMenu,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={styles.root}
      data-ready={ready ? "true" : "false"}
      data-covered={covered ? "true" : "false"}
      data-content={contentVisible ? "visible" : "hidden"}
      data-wds={wdsMode}
      style={{
        "--col-dur": `${COL_DUR}ms`,
        "--col-ease": EASE,
        "--content-fade": `${CONTENT_FADE}ms`,
        "--wds-letter-stagger": `${WDS_LETTER_STAGGER}ms`,
        "--wds-letter-duration": `${WDS_LETTER_DURATION}ms`,
        "--wds-letter-ease": WDS_LETTER_EASE,
        "--wds-letter-from": WDS_LETTER_FROM,
      }}
    >
      <div className={styles.columns} aria-hidden="true">
        {Array.from({ length: COL_COUNT }, (_, i) => (
          <div
            key={i}
            className={styles.column}
            style={{
              "--col-delay": `${(COL_COUNT - 1 - i) * COL_STAGGER}ms`,
            }}
          />
        ))}
      </div>
      {showMenu ? (
        <div className={styles.content}>
          <MenuOverlay active={contentVisible} />
        </div>
      ) : null}
      <p className={styles.wds} aria-hidden="true">
        {LETTERS.slice(0, WDS_LETTER_COUNT).map((letter, index) => (
          <span
            key={letter}
            className={styles.wdsLetter}
            style={{ "--letter-i": String(index) }}
          >
            {letter}
          </span>
        ))}
      </p>
    </div>
  );
}
