import UpRightArrow from "./UpRightArrow";
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
      <UpRightArrow className={styles.arrow} />
    </>
  );

  if (href) {
    const internal =
      href.startsWith("/") || href.startsWith("#") || href.startsWith("?");
    return (
      <a
        href={href}
        className={classNames}
        {...(internal
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
      >
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
