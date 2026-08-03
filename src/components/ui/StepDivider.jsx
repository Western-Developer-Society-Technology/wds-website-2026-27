import styles from "./StepDivider.module.css";

/**
 * The blocky pixel-staircases that separate sections. Two shapes, two variants:
 *
 * `blocks` (hero → what we do): free-standing white rectangles on the ink
 *   background. Bands are [x, y, width, height].
 *
 * `stepped` (portfolios → team): the ink/white boundary itself steps down, with
 *   a 50px yellow band riding along that edge. Bands are [x, width, depth],
 *   where depth counts 50px steps.
 *
 * Neither is generated — the step widths are hand-authored and irregular in the
 * design, though both quantise to a 25px horizontal / 50px vertical grid.
 * Coordinates are design pixels inside a 1920 × 200 box.
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

/**
 * Portfolios → Team. Two symmetric V-notches; widths sum to 1920. A column's
 * ink runs to depth*50 and its yellow band occupies the 50px below that.
 */
export const TEAM_DIVIDER_BANDS = [
  // [x, width, depth]
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

export const STEP_DIVIDER_HEIGHT = 200;
const STEP = 50;

const pctX = (n) => `${(n / 1920) * 100}%`;
const pctY = (n) => `${(n / STEP_DIVIDER_HEIGHT) * 100}%`;

export default function StepDivider({
  variant = "blocks",
  bands = HERO_BANDS,
  className,
}) {
  return (
    <div
      className={[styles.divider, className].filter(Boolean).join(" ")}
      data-variant={variant}
      aria-hidden="true"
    >
      {variant === "stepped"
        ? bands.map(([x, w, depth], i) => (
            <span key={i} className={styles.column} style={{ left: pctX(x), width: pctX(w) }}>
              {depth > 0 ? (
                <span
                  className={styles.ink}
                  style={{ top: 0, height: pctY(depth * STEP) }}
                />
              ) : null}
              <span
                className={styles.accent}
                style={{ top: pctY(depth * STEP), height: pctY(STEP) }}
              />
            </span>
          ))
        : bands.map(([x, y, w, h], i) => (
            <span
              key={i}
              className={styles.band}
              style={{ left: pctX(x), top: pctY(y), width: pctX(w), height: pctY(h) }}
            />
          ))}
    </div>
  );
}
