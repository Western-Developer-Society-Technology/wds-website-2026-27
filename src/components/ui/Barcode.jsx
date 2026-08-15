import styles from "./Barcode.module.css";

const BARS = [3.83333, 7, 13, 18, 3.83333, 8];
const GAPS = [4, 4, 4, 4.16667, 4];
const TOTAL =
  BARS.reduce((sum, size) => sum + size, 0) +
  GAPS.reduce((sum, size) => sum + size, 0);

function segments(reverse) {
  const bars = reverse ? [...BARS].reverse() : BARS;
  const gaps = reverse ? [...GAPS].reverse() : GAPS;
  const items = [];

  bars.forEach((bar, i) => {
    items.push({ type: "bar", size: bar });
    if (i < gaps.length) items.push({ type: "gap", size: gaps[i] });
  });

  return items;
}

export default function Barcode({
  orientation = "vertical",
  color = "currentColor",
  reverse = false,
  className = "",
}) {
  const classNames = [
    styles.root,
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={{ color }}
      role="presentation"
      aria-hidden="true"
    >
      {segments(reverse).map((item, i) => (
        <span
          key={i}
          className={item.type === "bar" ? styles.bar : styles.gap}
          style={{ flexBasis: `${(item.size / TOTAL) * 100}%` }}
        />
      ))}
    </div>
  );
}
