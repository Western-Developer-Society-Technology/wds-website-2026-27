import { PORTFOLIOS } from "@/components/sections/Portfolios/portfolioData";
import { teamMembers } from "@/components/sections/Team/teamData";

// Role descriptions and portfolio descriptions follow the "WDS 26/27 Vice President Role Descriptions" document.
const APPLICATION_DETAILS = {
  development: {
    tags: ["Project Management", "Leadership"],
    spots: 4,
    description:
      "Lead project-based initiatives that give members hands-on technical experience while creating meaningful outcomes for the club. You'll lead either one 8-month project or two 4-month projects of your choice with a team you help build. Come prepared to discuss your project idea during the interview process.",
    portfolioDescription:
      "Development is WDS's client-facing project portfolio, where the two VPs each lead a year-long build for a different company. Each project gives members the chance to work on a real product for real stakeholders, turning a company's needs into something useful and giving the team meaningful work to learn from and showcase. It offers a different kind of technical experience from a class or personal project because the work is shaped by an actual organization and its goals.",
  },
  internals: {
    tags: ["Operations", "Community"],
    spots: 3,
    description:
      "Manage and nurture the club community, ensuring that members and our core team have a positive experience and receive opportunities for personal and professional growth.",
    portfolioDescription:
      "Internals shapes the culture and member experience of WDS, creating a welcoming community where people feel connected, supported, and motivated to participate. The portfolio focuses on the relationships, traditions, and shared experiences that help members grow with the club and feel that they belong within it. It pays attention to how members experience WDS between major events, making community part of everyday participation rather than something limited to occasional socials.",
  },
  careers: {
    tags: ["Community", "Networking"],
    spots: 3,
    description:
      "Support members' career aspirations, facilitate professional development, and enhance employability through targeted events and partnerships.",
    portfolioDescription:
      "Careers helps members build confidence for their next steps by connecting them with practical learning, professional networks, and opportunities across technology and business. It creates approachable ways for students to explore industries, develop career-ready skills, and learn from professionals in the fields they hope to enter. The portfolio turns networking from a one-time interaction into an ongoing part of how members learn about possibilities and prepare for them.",
  },
  flagship: {
    tags: ["Partnerships", "Outreach"],
    spots: 3,
    description:
      "Lead the planning and execution of Spark, the club's flagship event: a hybrid hackathon and business case competition bringing together 100+ participants to solve real-world problems through technical and strategic thinking.",
    portfolioDescription:
      "Flagship creates WDS's largest cross-disciplinary experiences, centred on Spark, our hybrid hackathon and business case competition. The portfolio brings together technical problem-solving, business thinking, and external collaboration to create an ambitious, accessible, and memorable experience for participants, partners, and the wider WDS community. Spark gives students from different backgrounds a shared platform to test ideas, build under pressure, and connect their work to real-world challenges.",
  },
  finance: {
    tags: ["Budgeting", "Organization"],
    spots: 2,
    description:
      "Oversee the club's financial matters, from budgeting to reporting.",
    portfolioDescription:
      "Finance provides the structure for responsible growth at WDS, maintaining a clear and reliable view of the club's resources. It supports thoughtful decision-making and long-term sustainability so WDS can invest in strong programs, events, and member experiences with confidence. Its work helps the rest of the organization plan ambitiously while staying accountable to the students and partners who make WDS possible.",
  },
  technology: {
    tags: ["Programming", "Events"],
    spots: 4,
    description:
      "Support the club's technological needs, from event support to maintaining and innovating on past and present projects.",
    portfolioDescription:
      "Technology builds and maintains the digital infrastructure behind WDS, including the WDS website, the Spark website, and website projects for other clubs. It also organizes and manages a WDS hackathon team that competes in hackathons, giving students a way to collaborate and represent the club beyond its own events. Through events and workshops on emerging technologies, the portfolio helps students turn what they learn into practical projects they can use, share, and be proud of.",
  },
  marketing: {
    tags: ["Creative Direction", "Campaigns"],
    spots: 3,
    description:
      "Create and maintain the club's brand image and manage its presence on various social media platforms.",
    portfolioDescription:
      "Marketing leads the visual and public presence of WDS, handling most of the club's design work and running its social media channels. It turns events, projects, and opportunities into clear, engaging campaigns that reach the right students and maximize event engagement. Across every announcement and event touchpoint, the portfolio builds a consistent WDS identity while making the club's work easy to understand and exciting to join.",
  },
};

export const PORTFOLIO_APPLICATIONS = PORTFOLIOS.map((portfolio) => {
  const application = APPLICATION_DETAILS[portfolio.id];

  if (!application) {
    throw new Error(`Missing application details for ${portfolio.id}`);
  }

  return { ...portfolio, ...application };
});

const PORTFOLIO_ROLE_MAP = {
  development: "VP Development",
  internals: "VP Internal",
  careers: "VP Careers",
  flagship: "VP Flagship",
  finance: "VP Finance",
  technology: "VP Technology",
  marketing: "VP Marketing",
};

export const PORTFOLIO_TEAMS = Object.fromEntries(
  Object.entries(PORTFOLIO_ROLE_MAP).map(([id, role]) => {
    const members = teamMembers
      .filter((member) => member.role === role)
      .map(({ id: memberId, name, role: memberRole, src }) => ({
        id: memberId,
        name,
        role: memberRole,
        src,
      }));

    return [id, members];
  }),
);

export const TEAM_PREVIEW = PORTFOLIO_TEAMS;
