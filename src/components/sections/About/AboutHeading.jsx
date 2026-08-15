"use client";

import Image from "next/image";
import useReveal from "@/lib/useReveal";
import styles from "./About.module.css";

function HeadingText({ overlay = false }) {
  return (
    <>
      <span className={overlay ? styles.leadHidden : undefined}>
        more than just<br />a&nbsp;
      </span>
      <span className={`${styles.nowrap} ${overlay ? styles.mark : ""}`}>
        tech
        <span className={styles.asteriskSlot}>
          <Image
            src="/icons/asteriskicon.svg"
            alt=""
            width={51}
            height={49}
            className={styles.asterisk}
          />
        </span>
        club.
      </span>
    </>
  );
}

export default function AboutHeading() {
  const [ref, revealed] = useReveal({
    rootMargin: "0px 0px -35% 0px",
  });

  return (
    <div className={styles.headingWrap} ref={ref}>
      <h2 className={styles.heading}>
        <HeadingText />
      </h2>
      <div
        className={`${styles.headingOverlay} ${revealed ? styles.revealed : ""}`}
        aria-hidden="true"
      >
        <div className={styles.blueMark} />
        <p className={styles.heading}>
          <HeadingText overlay />
        </p>
      </div>
    </div>
  );
}
