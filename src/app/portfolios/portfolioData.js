import { PORTFOLIOS } from "@/components/sections/Portfolios/portfolioData";

const APPLICATION_DETAILS = {
  development: {
    tags: ["Project Management", "Leadership"],
    spots: 4,
    description:
      "Lead and manage a long-term technical project while building and supporting a team of members. You'll create hands-on opportunities for members to learn, contribute, and showcase meaningful projects.",
  },
  internals: {
    tags: ["Operations", "Community"],
    spots: 3,
    description:
      "Shape the systems and experiences that keep WDS organized and connected. You'll support members, coordinate internal initiatives, and help every portfolio work well together.",
  },
  careers: {
    tags: ["Programming", "Networking"],
    spots: 3,
    description:
      "Create practical career programming that helps members move forward with confidence. You'll organize workshops, mentorship, and opportunities to connect with industry.",
  },
  externals: {
    tags: ["Partnerships", "Outreach"],
    spots: 3,
    description:
      "Build relationships beyond campus and bring new opportunities into WDS. You'll work with partners, speakers, and other student organizations to grow the society's reach.",
  },
  finance: {
    tags: ["Budgeting", "Organization"],
    spots: 2,
    description:
      "Keep WDS financially organized and ready to grow. You'll manage budgets, reimbursements, and sponsorship processes while helping portfolios make thoughtful spending decisions.",
  },
  technology: {
    tags: ["Infrastructure", "Systems"],
    spots: 4,
    description:
      "Build and maintain the technical systems that support the society. You'll improve internal tools, infrastructure, and workflows so every portfolio can operate effectively.",
  },
  marketing: {
    tags: ["Creative Direction", "Campaigns"],
    spots: 3,
    description:
      "Tell the WDS story through thoughtful campaigns and creative work. You'll shape content, visual assets, and event promotion while keeping the brand clear and consistent.",
  },
};

export const PORTFOLIO_APPLICATIONS = PORTFOLIOS.map((portfolio) => {
  const application = APPLICATION_DETAILS[portfolio.id];

  if (!application) {
    throw new Error(`Missing application details for ${portfolio.id}`);
  }

  return { ...portfolio, ...application };
});

export const RESPONSIBILITIES = [
  "Leading and managing portfolio initiatives from planning to completion, including goals, timelines, and deliverables.",
  "Recruiting and supporting a team by helping members get involved in portfolio work.",
  "Creating a collaborative environment where members can learn, contribute, and grow through real project experience.",
  "Tracking progress and ensuring initiatives remain organized, productive, and on schedule.",
  "Showcasing milestones and final outcomes internally within the club and externally to the broader community.",
];

export const REQUIREMENTS = [
  "Strong leadership and ownership mentality",
  "Ability to manage a team and keep projects on track",
  "Organized with good time management",
  "Genuine interest in building projects and helping others grow",
  "Ability to take initiative and work independently",
];

export const TEAM_PREVIEW = [
  { id: "preview-1", name: "Stephanie Li", role: "VP of Marketing" },
  { id: "preview-2", name: "Stephanie Li", role: "VP of Marketing" },
  { id: "preview-3", name: "Stephanie Li", role: "VP of Marketing" },
];
