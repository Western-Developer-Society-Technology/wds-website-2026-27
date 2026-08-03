/**
 * The WDS arrows. Geometry from design/reference/, inlined so they can take
 * `currentColor`.
 *
 * Two genuinely different glyphs, not one rotated: the chunky `down` arrow is
 * the hero scroll cue (stroke 22 on an 87-wide box); `up-right` is the fine
 * corner arrow inside buttons (stroke 2.6 on a 23-wide box, bevel joins).
 */
const GLYPHS = {
  down: {
    viewBox: "0 0 87 94",
    d: "M43.0996 0V79M7.09961 48.5743L43.0996 79L79.0996 48.5743",
    strokeWidth: 22,
  },
  "up-right": {
    viewBox: "0 0 23 24",
    d: "M0.958197 22.5928L20.7576 1.30777M20.7577 22.5918L20.7576 1.30777L0.959275 1.30786",
    strokeWidth: 2.61566,
    strokeLinejoin: "bevel",
  },
};

export default function ArrowIcon({ direction = "down", className, style }) {
  const glyph = GLYPHS[direction] ?? GLYPHS.down;

  return (
    <svg
      viewBox={glyph.viewBox}
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={glyph.d}
        stroke="currentColor"
        strokeWidth={glyph.strokeWidth}
        strokeLinejoin={glyph.strokeLinejoin}
      />
    </svg>
  );
}
