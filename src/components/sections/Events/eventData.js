// TODO: Confirm event dates before launch.
//
// Each event carries everything both carousels and the detail card need:
//   id, title, date, src/alt   -> poster (carousel)
//   location, time             -> pill facts on the detail card
//   body, list                 -> detail-card copy (list is optional)
//   photos                     -> detail-card photo strip (placeholders for now)
//
// To add an event: drop a new object into UPCOMING_EVENTS or PAST_EVENTS.
// To move one between sections (e.g. once it's happened): cut it from one
// array and paste it into the other. No other code needs to change.

const PLACEHOLDER_PHOTO = "/images/events/placeholders/photo-placeholder.svg";

function placeholderPhotos(count, widths) {
  return Array.from({ length: count }, (_, index) => ({
    src: PLACEHOLDER_PHOTO,
    alt: "",
    width: widths?.[index] ?? 309,
    height: 207,
  }));
}

export const UPCOMING_EVENTS = [
  {
    id: "jobs-in-2026",
    title: "jobs in 2026",
    date: "January 2026",
    src: "/images/events/jobsin2026event.jpg",
    alt: "Jobs in 2026 event poster",
    location: "SEB 201",
    time: "5pm - 7pm",
    body: [
      "A panel and networking night on how hiring, internships, and new-grad roles are changing in tech going into 2026.",
      "Hear directly from recruiters and recent grads, then stick around to ask questions one-on-one.",
    ],
    list: {
      heading: "What to bring:",
      items: ["Resume (printed or digital)", "Questions for the panel", "An open mind"],
    },
    photos: placeholderPhotos(3, [165, 309, 166]),
  },
  {
    id: "spark-hackathon",
    title: "spark hackathon",
    date: "February 1, 2026",
    src: "/images/events/sparkhackathonevent.jpg",
    alt: "Spark hackathon event poster",
    location: "TC 101",
    time: "9am - 9pm",
    body: [
      "A one-day hackathon for beginners and veterans alike — build something in a weekend, pitch it to judges, and win prizes.",
      "Teams of up to 4. Solo hackers welcome; we'll help you find a team at the door.",
    ],
    list: {
      heading: "Are you fit for this event?",
      items: [
        "Curious about building something from scratch",
        "Comfortable working in a small team",
        "New to hackathons? Even better — mentors will be on site",
      ],
    },
    photos: placeholderPhotos(4, [165, 309, 166, 260]),
  },
  {
    id: "poker-networking",
    title: "poker networking",
    date: "March 7, 2026",
    src: "/images/events/pokernetworkingevent.jpg",
    alt: "Poker networking event poster",
    location: "UCC 65",
    time: "6pm - 9pm",
    body: [
      "Low-stakes poker, high-stakes networking. Meet sponsors and alumni over a few hands of cards.",
      "No poker experience required — we'll teach you the rules at the table.",
    ],
    photos: placeholderPhotos(3, [220, 309, 220]),
  },
  {
    id: "summer-social",
    title: "summer social",
    date: "August 14, 2026",
    src: "/images/events/summersocialevent.jpeg",
    alt: "Summer social event poster",
    location: "Storybook Gardens",
    time: "5:30pm - 7:30pm",
    body: [
      "Our end-of-summer hangout before the fall term kicks off — games, snacks, and catching up with the club.",
    ],
    photos: placeholderPhotos(2, [340, 340]),
  },
];

export const PAST_EVENTS = [
  {
    id: "tech-mixer",
    title: "tech mixer",
    date: "September 24, 2025",
    src: "/images/events/techmixerevent.png",
    alt: "Tech mixer recap photo",
    location: "SEB 201",
    time: "4pm - 6pm",
    body: [
      "a. Leading and managing a project from planning to completion, including goals, timelines, and deliverables.",
      "b. Recruiting and supporting a project team by helping members get involved in technical, design, or business roles.",
      "c. Creating a collaborative environment where members can learn, contribute, and grow through real project experience.",
      "d. Tracking progress and ensuring projects remain organized, productive, and on schedule.",
      "e. Showcasing project milestones and final outcomes internally within the club and externally to the broader community.",
    ],
    list: {
      heading: "Are you fit for this role?:",
      items: [
        "Strong leadership and ownership mentality",
        "Ability to manage a team and keep projects on track",
        "Organized with good time management",
        "Genuine interest in building projects and helping others grow",
        "Ability to take initiative and work independently",
      ],
    },
    photos: placeholderPhotos(3, [165, 309, 166]),
  },
  {
    id: "tech-picnic-mixer",
    title: "tech picnic mixer",
    date: "September 8, 2025",
    src: "/images/events/techpicnicmixerevent.jpg",
    alt: "Western Tech Picnic Mixer event poster",
    location: "Gibbons Park",
    time: "2pm - 5pm",
    body: [
      "Our first mixer of the year — an outdoor picnic to meet the exec team and other members before classes ramp up.",
    ],
    photos: placeholderPhotos(3, [220, 309, 220]),
  },
  {
    id: "networking-with-linkedin-101",
    title: "networking with linkedin 101",
    date: "2025",
    src: "/images/events/networkingwithlinkedin101event.jpg",
    alt: "Networking with LinkedIn 101 event poster",
    location: "WSC 55",
    time: "6pm - 7:30pm",
    body: [
      "A workshop on building a LinkedIn profile that actually gets noticed, plus tips for cold outreach that doesn't feel cold.",
    ],
    photos: placeholderPhotos(2, [340, 340]),
  },
];

const ALL_EVENTS = [...UPCOMING_EVENTS, ...PAST_EVENTS];

function byId(id) {
  const event = ALL_EVENTS.find((candidate) => candidate.id === id);
  if (!event) throw new Error(`Unknown event: ${id}`);
  return event;
}

// The home page carousel keeps its own hand-picked order and starting index,
// independent of the upcoming/previous split above.
export const EVENTS = [
  "jobs-in-2026",
  "spark-hackathon",
  "tech-picnic-mixer",
  "tech-mixer",
  "summer-social",
  "poker-networking",
  "networking-with-linkedin-101",
].map(byId);

export const INITIAL_ACTIVE = 3;
