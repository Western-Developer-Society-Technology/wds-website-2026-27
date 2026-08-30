import { createGridPath } from "@/lib/gridPath";
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

const GRID_PATH = createGridPath(CELLS);

export default function AboutGrid() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <svg className={styles.gridSvg} viewBox="0 0 5 4" preserveAspectRatio="xMinYMin meet">
        <path d={GRID_PATH} vectorEffect="non-scaling-stroke" strokeLinecap="square" />
      </svg>
    </div>
  );
}
