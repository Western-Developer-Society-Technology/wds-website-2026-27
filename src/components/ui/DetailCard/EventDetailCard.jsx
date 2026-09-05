import DetailCard from "./DetailCard";
import styles from "./DetailCard.module.css";

// Maps an event record (see src/components/sections/Events/eventData.js)
// onto the generic DetailCard. `action` is omitted entirely for previous
// events (no rsvp).
export default function EventDetailCard({ event, theme = "light", action }) {
  return (
    <DetailCard
      theme={theme}
      date={event.date}
      title={event.title}
      pills={[event.location, event.time].filter(Boolean)}
      photos={event.photos ?? []}
      action={action}
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
