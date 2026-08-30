import { createGridPath } from "@/lib/gridPath";
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

const GRID_PATH = createGridPath(CELLS);

export default function HeroGrid() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <svg className={styles.gridSvg} viewBox="0 0 9 4" preserveAspectRatio="xMinYMin meet">
        <path d={GRID_PATH} vectorEffect="non-scaling-stroke" strokeLinecap="square" />
      </svg>
    </div>
  );
}
