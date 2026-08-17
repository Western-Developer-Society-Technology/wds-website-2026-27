"use client";

import { useEffect, useState } from "react";
import MenuOverlay from "./MenuOverlay";
import {
  COL_COUNT,
  COL_DUR,
  COL_STAGGER,
  CONTENT_FADE,
  EASE,
  WDS_FADE,
} from "./timing";
import styles from "./Curtain.module.css";

export default function Curtain({
  covered,
  contentVisible,
  wdsVisible,
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
      data-wds={wdsVisible ? "visible" : "hidden"}
      style={{
        "--col-dur": `${COL_DUR}ms`,
        "--col-ease": EASE,
        "--content-fade": `${CONTENT_FADE}ms`,
        "--wds-fade": `${WDS_FADE}ms`,
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
        wds
      </p>
    </div>
  );
}
