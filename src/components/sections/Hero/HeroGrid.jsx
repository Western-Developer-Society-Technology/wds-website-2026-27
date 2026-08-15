import styles from "./Hero.module.css";

const CELLS = [
  [1, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [0, 1],
  [2, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [8, 1],
  [3, 2],
  [4, 2],
  [5, 3],
];

export default function HeroGrid() {
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
