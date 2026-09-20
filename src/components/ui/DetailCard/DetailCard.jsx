import UpRightArrow from "@/components/ui/UpRightArrow";
import PhotoStrip from "./PhotoStrip";
import styles from "./DetailCard.module.css";

function ActionControl({ action }) {
  const className = styles.action;
  const content = (
    <>
      {action.label}
      {!action.disabled && <UpRightArrow className={styles.actionArrow} />}
      {action.external && <span className={styles.srOnly}> (opens in a new tab)</span>}
    </>
  );

  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
        className={className}
        data-tone={action.tone}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={action.onClick}
      disabled={action.disabled}
      data-tone={action.tone}
    >
      {content}
    </button>
  );
}

// Generic, reusable "detail card": a themed panel pairing a photo strip
// and a few pill facts on the left with free-form body content on the
// right. Used by the events page (event info + rsvp), and reusable as-is
// for the portfolios and hackathon-team pages (their own pills/body/action).
export default function DetailCard({
  theme = "light",
  date,
  title,
  pills = [],
  photos = [],
  action,
  actions,
  children,
}) {
  const actionItems = actions ?? (action ? [action] : []);

  return (
    <article className={styles.card} data-theme={theme}>
      <div className={styles.left}>
        {date && <p className={styles.date}>{date}</p>}
        {title && <h3 className={styles.title}>{title}</h3>}
        {pills.length > 0 && (
          <div className={styles.pills} aria-label="Details">
            {pills.map((pill) => (
              <span key={pill} className={styles.pill}>
                {pill}
              </span>
            ))}
          </div>
        )}
        {photos.length > 0 && <PhotoStrip photos={photos} theme={theme} />}
      </div>

      <div className={styles.right}>
        <div className={styles.body}>{children}</div>
        {actionItems.length > 0 && (
          <div className={styles.actions}>
            {actionItems.map((item) => (
              <ActionControl key={item.label} action={item} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
