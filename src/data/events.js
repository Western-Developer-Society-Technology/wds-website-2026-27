/**
 * Events shown in the "our events" carousel.
 *
 * The carousel is fully data-driven: cards, their spacing, and the progress
 * markers below all derive from this array, so adding an event is a one-entry
 * change. `image` may be null — the card falls back to a flat ink block rather
 * than a broken image.
 *
 * NOTE ON THE IMAGES: these two were cropped 1:1 out of design/figma-1920.png
 * because the originals were never exported. They are exactly the size the
 * card renders at (708 × 472), so they look right at 1920 but have no headroom
 * on a larger display — replace them with the source photos when you have them.
 *
 * The design also shows a third card (a casino/poker night) bleeding off the
 * right edge to signal that the row scrolls. Its caption is not legible in the
 * render and only ~176px of the photo is on-canvas, so it is not included —
 * add it here once you have the title, date and image.
 */
export const events = [
  {
    slug: "spark-hackathon",
    title: "Spark Hackathon",
    meta: "January 30 2025",
    image: "/images/events/spark-hackathon.png",
    href: "#events",
  },
  {
    slug: "mentorship-program",
    title: "Mentorship Program",
    meta: "Workshop",
    image: "/images/events/mentorship-program.png",
    href: "#events",
  },
];

export default events;
