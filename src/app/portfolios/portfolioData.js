import { PORTFOLIOS } from "@/components/sections/Portfolios/portfolioData";

// Role descriptions, responsibilities, and requirements follow the
// "WDS 26/27 Vice President Role Descriptions" document. The Flagship
// (Spark Hackathon) mandate is listed under externals, the matching tile.
const APPLICATION_DETAILS = {
  development: {
    tags: ["Project Management", "Leadership"],
    spots: 4,
    description:
      "Lead project-based initiatives that give members hands-on technical experience while creating meaningful outcomes for the club. You'll lead either one 8-month project or two 4-month projects of your choice with a team you help build. Come prepared to discuss your project idea during the interview process.",
    responsibilities: [
      "Leading and managing a project from planning to completion, including goals, timelines, and deliverables.",
      "Recruiting and supporting a project team by helping members get involved in technical, design, or business roles.",
      "Creating a collaborative environment where members can learn, contribute, and grow through real project experience.",
      "Tracking progress and ensuring projects remain organized, productive, and on schedule.",
      "Showcasing project milestones and final outcomes internally within the club and externally to the broader community.",
    ],
    requirements: [
      "Strong leadership and ownership mentality",
      "Ability to manage a team and keep projects on track",
      "Organized with good time management",
      "Genuine interest in building projects and helping others grow",
      "Ability to take initiative and work independently",
    ],
  },
  internals: {
    tags: ["Operations", "Community"],
    spots: 3,
    description:
      "Manage and nurture the club community, ensuring that members and our core team have a positive experience and receive opportunities for personal and professional growth.",
    responsibilities: [
      "Organizing and running club socials within the core team.",
      "Developing and maintaining a strong club community through team-building activities and effective communication among members while collaborating with other campus clubs.",
      "Implementing and overseeing a fellowship program to support member development and knowledge sharing.",
      "Continuously working to improve member experience by gathering feedback and implementing changes based on that feedback.",
      "Managing club merchandise initiatives by designing and coordinating apparel or promotional items that strengthen club identity, increase member engagement, and create a sense of community.",
    ],
    requirements: [
      "Previous leadership experience (clubs, jobs, etc.)",
      "Able to connect with people, make members feel included, and build relationships across the club.",
      "Can sense team morale, notice when members feel disconnected, and respond well.",
      "A creative mindset: you can think of engaging socials, team-building ideas, and fresh ways to improve culture.",
    ],
  },
  careers: {
    tags: ["Community", "Networking"],
    spots: 3,
    description:
      "Support members' career aspirations, facilitate professional development, and enhance employability through targeted events and partnerships.",
    responsibilities: [
      "Planning and executing career-focused events such as career fairs, resume workshops, mock interviews, and industry speaker sessions to provide members with insights and opportunities in their fields of interest.",
      "Establishing partnerships with companies, alumni, and professional organizations to create internship and job opportunities for club members.",
      "Organizing Hackathon prep, the WITS Summit, and assisting presidents in organizing firm trips.",
    ],
    requirements: [
      "Experience or strong interest in technology, business, or related fields",
      "Able to communicate professionally with students, sponsors, and external partners",
      "Strong company outreach skills and ability to build relationships with organizations",
      "Capable of organizing large-scale workshops, events, and hackathons",
      "Able to secure sponsors and support event funding initiatives",
    ],
  },
  externals: {
    tags: ["Partnerships", "Outreach"],
    spots: 3,
    description:
      "Lead the planning and execution of Spark, the club's flagship event: a hybrid hackathon and business case competition bringing together 100+ participants to solve real-world problems through technical and strategic thinking.",
    responsibilities: [
      "Defining and driving the overall vision, structure, and theme of Spark, ensuring a strong integration between the hackathon and business case components.",
      "Recruiting, leading, and managing a team of directors (e.g., logistics, partnerships, marketing, operations, judging) to execute all areas of the event.",
      "Securing sponsorships and industry partnerships, including sourcing case challenges, mentors, and judges.",
      "Designing the competition experience, including tracks, judging criteria, workshops, and final presentations.",
      "Overseeing all event logistics, including timeline planning, venue coordination, and day-of execution.",
      "Ensuring a high-quality participant experience that supports both technical building and strategic problem-solving.",
    ],
    requirements: [
      "Strong leadership and ability to manage multiple teams",
      "Experience leading large-scale events or complex, multi-phase projects",
      "Strong communication and outreach skills, especially for sponsorships, partnerships, and external relations",
      "Ability to think strategically about both technical and business-focused experiences",
      "Highly organized with excellent time management",
      "Ability to collaborate effectively as a co-lead",
      "Passion for building impactful, cross-disciplinary experiences",
    ],
  },
  finance: {
    tags: ["Budgeting", "Organization"],
    spots: 2,
    description:
      "Oversee the club's financial matters, from budgeting to reporting.",
    responsibilities: [
      "Developing and managing the club's annual budget, ensuring that resources are allocated effectively and responsibly.",
      "Managing club revenue streams, including membership fees, event ticket sales, and sponsorships.",
      "Keeping accurate and up-to-date financial records, and presenting financial reports to the executive team.",
    ],
    requirements: [
      "Strong attention to detail and experience with the ability to keep accurate financial records",
      "Comfortable managing budgets, tracking expenses, and using spreadsheets",
      "Clear communication skills for presenting financial updates to the executive team",
    ],
  },
  technology: {
    tags: ["Programming", "Events"],
    spots: 4,
    description:
      "Support the club's technological needs, from event support to maintaining and innovating on past and present projects.",
    responsibilities: [
      "Managing the maintenance and updates of the club's technology assets, such as websites, databases, and project repositories.",
      "Hosting technical workshops throughout the year to help members build practical skills.",
      "Leading the WDS Hackathon Team: finding sponsors, organizing the team for each hackathon, and leading other related initiatives.",
    ],
    requirements: [
      "Experience in frontend and backend development",
      "Projects portfolio (if you do not have one, that is okay!)",
      "Experience with hackathon culture",
      "Great leadership and team-building skills",
    ],
  },
  marketing: {
    tags: ["Creative Direction", "Campaigns"],
    spots: 3,
    description:
      "Create and maintain the club's brand image and manage its presence on various social media platforms.",
    responsibilities: [
      "Developing and executing marketing strategies to promote the club's events, initiatives, and achievements.",
      "Managing the club's social media presence, including platforms such as Instagram, Discord, and LinkedIn.",
      "Creating engaging content (graphics and videos) for the club's social media.",
      "Collaborating with the other portfolios to secure media coverage and publicize events.",
    ],
    requirements: [
      "Familiarity with tools such as Photoshop, Figma, Canva, CapCut, etc.",
      "Experience creating content for social media (graphics, reels, posts) and understanding what performs well",
      "You bring ideas to the table and can handle quick turnarounds for event promotions",
      "Nice to have: photo/video camera",
    ],
  },
};

export const PORTFOLIO_APPLICATIONS = PORTFOLIOS.map((portfolio) => {
  const application = APPLICATION_DETAILS[portfolio.id];

  if (!application) {
    throw new Error(`Missing application details for ${portfolio.id}`);
  }

  return { ...portfolio, ...application };
});

export const TEAM_PREVIEW = [
  { id: "preview-1", name: "Stephanie Li", role: "VP of Marketing" },
  { id: "preview-2", name: "Stephanie Li", role: "VP of Marketing" },
  { id: "preview-3", name: "Stephanie Li", role: "VP of Marketing" },
];
