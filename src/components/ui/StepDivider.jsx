import styles from "./StepDivider.module.css";

/**
 * The blocky pixel-staircase that separates sections.
 *
 * Not a generated pattern — the design's step widths are hand-authored and
 * irregular (115, 50, 100, 100, 175, 75, …), so the bands are transcribed from
 * the render. Both edges quantise to a 25px horizontal / 50px vertical grid.
 *
 * Coordinates are design pixels inside a 1920 × 200 box.
 * Appears twice on the page: white here (hero → what we do) and yellow-on-ink
 * before The Team, which is a different band set — pass it as `bands`.
 */
const HERO_BANDS = [
  // [x, y, width, height]
  [0, 0, 115, 100],
  [115, 50, 50, 50],
  [165, 50, 100, 100],
  [265, 100, 100, 50],
  [365, 100, 175, 100],
  [540, 50, 75, 150],
  [615, 50, 175, 100],
  [790, 100, 125, 50],
  [915, 100, 200, 100],
  [1115, 100, 150, 50],
  [1265, 50, 100, 100],
  [1365, 50, 250, 50],
  [1615, 50, 150, 100],
  [1765, 100, 50, 50],
  [1815, 100, 105, 100],
];

export const STEP_DIVIDER_HEIGHT = 200;

/**
 * The Portfolios → Team divider, measured while building Portfolios.
 *
 * Structurally different from the hero one, so it needs its own variant rather
 * than this component's white bands: here the ink/white boundary itself steps
 * down, with a 50px yellow band riding along that edge. Each entry is
 * [x, width, depth] where depth counts 50px steps below design y 4912 — so a
 * column's ink runs to 4912 + depth*50 and its yellow band sits in the 50px
 * immediately below that.
 *
 * Two symmetric V-notches. Total width sums to 1920.
 */
export const TEAM_DIVIDER_BANDS = [
  [0, 150, 0],
  [150, 50, 1],
  [200, 100, 2],
  [300, 150, 3],
  [450, 50, 2],
  [500, 150, 1],
  [650, 621, 0],
  [1271, 150, 1],
  [1421, 50, 2],
  [1471, 150, 3],
  [1621, 100, 2],
  [1721, 50, 1],
  [1771, 149, 0],
];

export default function StepDivider({ bands = HERO_BANDS, className }) {
  return (
    <div
      className={[styles.divider, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {bands.map(([x, y, w, h], i) => (
        <span
          key={i}
          className={styles.band}
          style={{
            left: `${(x / 1920) * 100}%`,
            top: `${(y / STEP_DIVIDER_HEIGHT) * 100}%`,
            width: `${(w / 1920) * 100}%`,
            height: `${(h / STEP_DIVIDER_HEIGHT) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
