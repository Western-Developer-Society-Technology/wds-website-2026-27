/**
 * The big blue zigzag behind the hero.
 *
 * Drawn from a points array rather than imported from vchevron.svg, so the
 * geometry is owned in code and can be retuned or animated. It is rendered as
 * an inline <svg> polyline rather than CSS boxes on purpose: this is a 209px
 * stroke with *bevel* joins, and reproducing a bevelled join in CSS means
 * hand-computing the outline vertices for every corner (4 rotated rectangles
 * plus 3 clip-path triangles), which is both unreadable and fragile to edit.
 * A polyline gives the identical result and stays editable — say the word if
 * you'd still rather have the pure-CSS version.
 *
 * Coordinates are in hero space (the 1920 × 1115 stage). They were solved by
 * fitting the design render: the reference art sits at scale 1, offset
 * (-352, -397). Verified against three independent probes to within 1px.
 * Only the middle of the zigzag is on-canvas; the outer points sit above and
 * to the left of the frame, which is what clips the arms.
 */
const POINTS = [
  [-258, -197],
  [172, 670],
  [606, -266],
  [944, 95],
  [1341, -325],
];

const STROKE_WIDTH = 209;

/* preserveAspectRatio uses xMin, not xMid: at the design's aspect ratio the
   two are identical, but on a narrow viewport xMid crops to the middle of the
   zigzag and loses the big left V entirely. Anchoring left keeps it on screen. */

export default function HeroChevron({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1920 1115"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={POINTS.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--color-blue)"
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="bevel"
      />
    </svg>
  );
}
