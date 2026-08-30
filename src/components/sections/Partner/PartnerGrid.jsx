import { createGridPath } from "@/lib/gridPath";
import styles from "./Partner.module.css";

const CELLS = [
  [2, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [2, 2],
  [4, 2],
];

const GRID_PATH = createGridPath(CELLS);

export default function PartnerGrid() {
  return (
    <div className={styles.squares} aria-hidden="true">
      <svg className={styles.gridSvg} viewBox="0 0 5 3" preserveAspectRatio="xMinYMin meet">
        <path d={GRID_PATH} vectorEffect="non-scaling-stroke" strokeLinecap="square" />
      </svg>
    </div>
  );
}
