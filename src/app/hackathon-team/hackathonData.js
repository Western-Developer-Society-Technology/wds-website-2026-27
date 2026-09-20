const NORTH_PHOTOS = [
  {
    src: "/images/hackathon-team/hackthenorth/north-announcement.webp",
    alt: "Hack the North is back announcement",
    width: 165,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackthenorth/north-group.webp",
    alt: "Hack the North participants posing together",
    width: 309,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackthenorth/north-collage.webp",
    alt: "A collage of Hack the North highlights",
    width: 166,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackthenorth/north-community.webp",
    alt: "The Hack the North community",
    width: 310,
    height: 207,
  },
];

const VALLEY_PHOTOS = [
  {
    src: "/images/hackathon-team/hackthevalley/hackthevalley1.jpg",
    alt: "Participants checking in at a Hack the Valley registration table",
    width: 165,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackthevalley/hackthevalley2.jpg",
    alt: "Hack the Valley participants with laptops and pizza at the meal table",
    width: 165,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackthevalley/hackthevalley3.jpg",
    alt: "Group photo of Hack the Valley participants holding prizes",
    width: 368,
    height: 207,
  },
];

const UOFT_PHOTOS = [
  {
    src: "/images/hackathon-team/uofthacks/uofthacks1.jpg",
    alt: "UofT Hacks event highlights collage of participants in a lecture hall and at a table",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/uofthacks/uofthacks2.jpg",
    alt: "Live portrait drawing and photobooth highlights from UofT Hacks",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/uofthacks/uofthacks3.jpg",
    alt: "UofT Hacks art battle winner and spicy ramen challenge",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/uofthacks/uofthacks4.jpg",
    alt: "Cup stacking, merch shop, and Olympics activities at UofT Hacks",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/uofthacks/uofthacks5.jpg",
    alt: "Board games and an Amplitude AI workshop at UofT Hacks",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/uofthacks/uofthacks6.jpg",
    alt: "UofT Hacks volunteers, mentors, and a Foresters latte booth",
    width: 155,
    height: 207,
  },
];

const WESTERN_PHOTOS = [
  {
    src: "/images/hackathon-team/hackwestern/hackwestern1.jpg",
    alt: "Hack Western XII family group photos with veterans, newgens, and inflatable horse costumes",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackwestern/hackwestern2.jpg",
    alt: "Hack Western team polaroids for sponsorship, events, design, marketing, and web",
    width: 155,
    height: 207,
  },
  {
    src: "/images/hackathon-team/hackwestern/hackwestern3.jpg",
    alt: "Hack Western participants posing between event banners",
    width: 310,
    height: 207,
  },
];

export const HACKATHONS = [
  {
    id: "hack-the-north",
    title: "Hack the North",
    date: "September 18-20, 2026",
    src: "/images/hackathon-team/hackthenorth/hack-the-north.webp",
    alt: "Hack the North poster",
    location: "Waterloo, ON, CA",
    time: "In-Person",
    body: [
      "Welcome to Canada's biggest hackathon. This September, join 1,000+ hackers from around the world and build with people who think differently. Learn from world-class mentors, connect with the community, and turn ideas into something real. 13 years in, Hack the North continues to bring hands-on workshops, unforgettable experiences, and real connections with the companies shaping what's next in tech.",
      "Not from Waterloo? We cover food, help with travel expenses, and provide lodging so you can focus on turning your dreams into reality.",
    ],
    photos: NORTH_PHOTOS,
    ctaLabel: "join a team",
    applicationsClosed: true,
  },
  {
    id: "hack-the-valley-11",
    title: "Hack the Valley 11",
    date: "October 16-18, 2026",
    src: "/images/hackathon-team/hackthevalley/hack-the-valley.webp",
    alt: "Hack the Valley 11 poster",
    location: "UTSC, Toronto, ON, CA",
    time: "In-Person",
    body: [
      "Join 750 innovative and creative developers, designers, and creators for 36 hours of hacking. You'll get access to some of the best hardware and APIs on the market. Plus, you get to meet some experienced and awesome mentors!",
      "All this in just one weekend? I know, it's hard to believe.",
      "Remember, you don't need to be a pro to attend. So if this is your first hackathon, we can't wait to expose you to the incomparable world of creation.",
    ],
    photos: VALLEY_PHOTOS,
    ctaLabel: "join a team",
    applicationsClosed: false,
    website: "https://hackthevalley.io/",
  },
  {
    id: "hack-western-13",
    title: "Hack Western 13",
    date: "November 20-22, 2026",
    src: "/images/hackathon-team/hackwestern/hack-western.webp",
    alt: "Hack Western 13 poster",
    location: "Western University, London, ON, CA",
    time: "In-Person",
    body: [
        "HACKWESTERN is back!",
        "Our theme this year is Discover the Unknown and we can't wait to welcome everyone this November 20-22 in London, ON, CA",
        "Be ready and get hyped for more info coming soon…",
    ],
    photos: WESTERN_PHOTOS,
    ctaLabel: "join our community",
    applicationsClosed: false,
    website: "https://hackwestern.com/",
  },
  {
    id: "uoft-hacks",
    title: "UofT Hacks 14",
    date: "January 2027",
    src: "/images/hackathon-team/uofthacks/uoft-hacks.jpg",
    alt: "UofT Hacks 14 poster",
    location: "UTSG, Toronto, ON, CA",
    time: "In-Person",
    body: [
      "700+ hackers and 150+ projects! You guys really outdid it last time at UofTHacks13!!! It was a fun weekend filled with creativity, unforgettable moments, and lost sleep, (and carbonara xd) 😴",
      "Missed out on UofTHacks13? UofTHacks14 is on the way, this year bigger, better, and much more exciting! Stay tuned on this instagram page (@uofthacks) as more information will follow. Of course, please check the UofTHacks 14 website— link in bio!",
    ],
    photos: UOFT_PHOTOS,
    ctaLabel: "join our community",
    applicationsClosed: false,
    website: "https://uofthacks.com/",
  },
];
