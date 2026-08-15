import styles from "./About.module.css";

const CELLS = [
  [0, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [4, 3],
];

export default function AboutGrid() {
  return (
    <div className={styles.grid} aria-hidden="true">
      {CELLS.map(([col, row]) => (
        <span
          key={`${col}-${row}`}
          className={styles.cell}
          style={{ gridColumn: col + 1, gridRow: row + 1 }}
        />
      ))}
    </div>
  );
}
