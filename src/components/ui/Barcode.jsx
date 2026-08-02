import { makeRandom } from "@/lib/random";
import styles from "./Barcode.module.css";

/**
 * Barcode — a stripe block of randomised bar thicknesses.
 *
 * Generated rather than shipped as an SVG so each instance can differ. The
 * rhythm is taken from the Figma reference (design/reference/barcode.svg):
 * gaps are constant, bar thicknesses vary roughly 3.5–18 units. Sizes are
 * proportional (flex weights), so the block fills whatever box you give it —
 * set the width/height on the parent, not here.
 *
 * `seed` makes the pattern deterministic, which keeps server and client render
 * identical. Change the seed to get a different barcode; keep it to keep one.
 *
 * @param {number} bars        number of bars
 * @param {number} seed        PRNG seed — same seed, same pattern
 * @param {"horizontal"|"vertical"} orientation
 *        "horizontal" = horizontal bars stacked vertically (hero blocks);
 *        "vertical"   = vertical bars side by side (the full-bleed dividers).
 * @param {number} gap         gap weight, relative to bar weights
 * @param {number} minBar,maxBar  bar thickness range, same units as `gap`
 */
export default function Barcode({
  bars = 6,
  seed = 1,
  orientation = "horizontal",
  gap = 4,
  minBar = 3.5,
  maxBar = 18,
  className,
  style,
}) {
  const random = makeRandom(seed);
  const items = [];

  for (let i = 0; i < bars; i += 1) {
    if (i > 0) items.push({ bar: false, weight: gap });
    items.push({ bar: true, weight: minBar + random() * (maxBar - minBar) });
  }

  return (
    <div
      className={[styles.barcode, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
      style={style}
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <span
          key={i}
          className={item.bar ? styles.bar : styles.gap}
          style={{ flexGrow: item.weight }}
        />
      ))}
    </div>
  );
}
