import styles from "./CornerButton.module.css";

export default function CornerButton({
  children,
  className = "",
  href,
  variant,
}) {
  const classNames = `${styles.button} ${variant === "dark" ? styles.dark : ""} ${className}`.trim();
  const content = (
    <>
      <span className={`${styles.tick} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.tr}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.bl}`} aria-hidden="true" />
      <span className={`${styles.tick} ${styles.br}`} aria-hidden="true" />
      {children}
      <svg
        className={styles.arrow}
        viewBox="0 0 23 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0.956243 22.5928L20.7556 1.30777M20.7558 22.5918L20.7556 1.30777L0.957322 1.30786"
          stroke="currentColor"
          strokeWidth="2.61566"
          strokeLinejoin="bevel"
        />
      </svg>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classNames} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classNames}>
      {content}
    </button>
  );
}
