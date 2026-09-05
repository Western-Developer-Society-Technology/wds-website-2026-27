import styles from "./ArrowButton.module.css";

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Circular prev/next chevron control shared by every carousel/strip in the
// site (home + events posters, event-detail photo strip, portfolio tabs).
export default function ArrowButton({
  direction = "next",
  onClick,
  disabled = false,
  ariaLabel,
  theme = "light",
  className = "",
}) {
  const classNames = [
    styles.button,
    theme === "dark" ? styles.dark : "",
    direction === "prev" ? styles.prev : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? (direction === "prev" ? "Previous" : "Next")}
    >
      <ChevronIcon />
    </button>
  );
}
