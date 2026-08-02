/**
 * The WDS asterisk — the brand mark, used at least six times across the page.
 *
 * Inlined rather than loaded as an <img> so it can take `currentColor` (it
 * appears in yellow, white and ink) and so it can be spun on hover in the
 * animation pass. Geometry is verbatim from design/reference/asterisk.svg.
 */
export default function Asterisk({ className, style }) {
  return (
    <svg
      viewBox="0 0 75 76"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M37.3659 0V39.1579M37.3659 39.1579L68.1328 15.8496M37.3659 39.1579L6.13281 15.8496M37.3659 39.1579V75.0526M37.3659 39.1579L6.13281 55.0075M37.3659 39.1579L68.1328 55.0075"
        stroke="currentColor"
        strokeWidth="20.5113"
      />
    </svg>
  );
}
