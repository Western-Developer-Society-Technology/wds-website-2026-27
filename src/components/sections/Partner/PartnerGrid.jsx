import styles from "./Partner.module.css";

const CELLS = [
  [2, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [2, 2],
  [4, 2],
];

export default function PartnerGrid() {
  return (
    <div className={styles.squares} aria-hidden="true">
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
