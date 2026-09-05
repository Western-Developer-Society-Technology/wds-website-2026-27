import UpRightArrow from "@/components/ui/UpRightArrow";
import PhotoStrip from "./PhotoStrip";
import styles from "./DetailCard.module.css";

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
  children,
}) {
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
        {action && (
          <button type="button" className={styles.action} onClick={action.onClick}>
            {action.label}
            <UpRightArrow className={styles.actionArrow} />
          </button>
        )}
      </div>
    </article>
  );
}
