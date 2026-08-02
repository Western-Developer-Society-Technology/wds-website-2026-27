const ROTATION = { down: 0, left: 90, up: 180, right: 270 };

/**
 * The chunky WDS arrow. Geometry from design/reference/arrow.svg, inlined so
 * it can take `currentColor`.
 *
 * NOTE: the design also uses a diagonal ↗ inside the `learn more` / `view all`
 * buttons. That is a *different* glyph, not this one rotated 45° — it needs its
 * own export from Figma before prompt 2.
 */
export default function ArrowIcon({ direction = "down", className, style }) {
  const angle = ROTATION[direction] ?? 0;

  return (
    <svg
      viewBox="0 0 87 94"
      fill="none"
      className={className}
      style={{ ...style, transform: angle ? `rotate(${angle}deg)` : undefined }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M43.0996 0V79M7.09961 48.5743L43.0996 79L79.0996 48.5743"
        stroke="currentColor"
        strokeWidth="22"
      />
    </svg>
  );
}
