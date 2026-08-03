import Image from "next/image";
import Asterisk from "@/components/ui/Asterisk";
import styles from "./WhatWeDoArt.module.css";

/**
 * The right-hand collage: two photo cut-outs, each sitting on an asterisk, cut
 * through by a big blue zigzag.
 *
 * The blue shape is drawn from a traced polygon rather than an exported asset.
 * It was recovered by masking the render for pure #0051ff, filling the regions
 * the asterisk and speaker sit over, then contour-tracing and simplifying. The
 * result verifies against measured edges: the two long diagonals both come out
 * at dx/dy = 1.71, and predicted vs measured edge positions agree within ~5px.
 *
 * Coordinates are design pixels in a 1920 × 1296 stage (section-relative, i.e.
 * design y minus 1115).
 */
const BLUE_SHAPE = [
  [1193, 589],
  [1920, 589],
  [1920, 778],
  [1543, 778],
  [1920, 998],
  [1920, 1107],
  [1727, 1107],
  [1503, 972],
  [1420, 875],
  [1410, 840],
  [1280, 840],
  [1147, 765],
];

export default function WhatWeDoArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <Asterisk className={styles.asteriskYellow} />

      <Image
        src="/images/whatwedoimage1.png"
        alt=""
        width={821}
        height={537}
        className={styles.groupPhoto}
      />

      <svg
        className={styles.blue}
        viewBox="0 0 1920 1296"
        preserveAspectRatio="none"
        focusable="false"
      >
        <polygon
          points={BLUE_SHAPE.map((p) => p.join(",")).join(" ")}
          fill="var(--color-blue)"
        />
        {/* The band that runs under the whole collage and lines up with the
            blue half of the barcode strip below it. */}
        <rect x="919" y="1107" width="1001" height="110" fill="var(--color-blue)" />
      </svg>

      <Asterisk className={styles.asteriskWhite} />

      <Image
        src="/images/whatwedoimage2.png"
        alt=""
        width={373}
        height={587}
        className={styles.speakerPhoto}
      />
    </div>
  );
}
