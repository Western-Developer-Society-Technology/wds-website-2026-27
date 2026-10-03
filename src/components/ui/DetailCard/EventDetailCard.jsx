import DetailCard from "./DetailCard";
import styles from "./DetailCard.module.css";

// Maps a normalized event record onto the generic DetailCard.
// Previous Luma events can link to their original page through `action`.
export default function EventDetailCard({ event, theme = "light", action, actions }) {
  return (
    <DetailCard
      theme={theme}
      date={event.date}
      title={event.title}
      pills={[event.location, event.time].filter(Boolean)}
      photos={event.photos ?? []}
      action={action}
      actions={actions}
    >
      {event.body?.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {event.list && (
        <>
          <p className={styles.listHeading}>{event.list.heading}</p>
          <ol>
            {event.list.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </>
      )}
    </DetailCard>
  );
}
