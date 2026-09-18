import { PORTFOLIOS } from "../../components/sections/Portfolios/portfolioData.js";
import { MAX_RESUME_BYTES } from "../../lib/applications/resume.js";

const INTERESTS = {
  technology: ["Web development", "Technical workshops", "Hackathon team"],
  marketing: ["Graphic design", "Social media", "Photo & video"],
  development: ["Project planning", "Building products", "Team leadership"],
  internals: ["Team socials", "Member experience", "Merchandise"],
  careers: ["Workshops", "Industry outreach", "Networking events"],
  flagship: ["Sponsorships", "Event logistics", "Partnerships"],
  finance: ["Budgeting", "Record keeping", "Financial reporting"],
};

const CAREERS_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      {
        id: "name",
        type: "short",
        label: "Full Name",
        placeholder: "your full name",
        autoComplete: "name",
        required: true,
        maxLength: 120,
      },
      {
        id: "email",
        type: "email",
        label: "Preferred Email",
        placeholder: "you@example.com",
        autoComplete: "email",
        required: true,
        maxLength: 254,
      },
      {
        id: "year",
        type: "dropdown",
        label: "Year of Study",
        placeholder: "select your year",
        options: ["1", "2", "3", "4", "5+"],
        required: true,
      },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      {
        id: "motivation",
        type: "paragraph",
        label: "Why WDS and why Careers?",
        required: true,
      },
      {
        id: "event_engagement",
        type: "paragraph",
        label: "Event engagement has been low, and attendance at our events has been below expectations. How would you approach identifying the cause and improving engagement?",
        required: true,
      },
      {
        id: "event_proposal",
        type: "paragraph",
        label: "You have the opportunity to introduce a new careers event. What would you propose and why, and how would you approach planning and executing it from start to finish?",
        required: true,
      },
    ],
  },
];

const MARKETING_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      {
        id: "name",
        type: "short",
        label: "Full name",
        placeholder: "your full name",
        autoComplete: "name",
        required: true,
        maxLength: 120,
      },
      {
        id: "year",
        type: "dropdown",
        label: "Year of Study",
        placeholder: "select your year",
        options: ["1", "2", "3", "4", "5+"],
        required: true,
      },
      {
        id: "program",
        type: "short",
        label: "Program",
        required: true,
        maxLength: 200,
      },
      {
        id: "email",
        type: "email",
        label: "Western email",
        placeholder: "you@uwo.ca",
        autoComplete: "email",
        required: true,
        maxLength: 254,
      },
      {
        id: "instagram",
        type: "url",
        label: "Instagram profile link",
        placeholder: "https://instagram.com/yourusername",
        required: true,
        maxLength: 2048,
      },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      {
        id: "marketing_experience",
        type: "paragraph",
        label: "Do you have any marketing, design, content, or social media experience? If so, tell us about it.",
        required: true,
      },
      {
        id: "work_sample",
        type: "url",
        label: "Link your portfolio or any work samples (portfolio site, Figma, Drive folder, Instagram, etc.)",
        description: "Share a link and make sure reviewers can access it.",
        required: true,
        placeholder: "https://",
        maxLength: 2048,
      },
      {
        id: "interests",
        type: "checkboxes",
        label: "Which areas of marketing interest you most?",
        description: "Choose as many as you like.",
        options: ["Graphic design", "Social media and content", "Videography and photography", "Copywriting", "Brand and strategy", "Event coverage"],
        required: true,
      },
      {
        id: "tools",
        type: "checkboxes",
        label: "Which tools are you comfortable using?",
        required: true,
        description: "Choose all that apply.",
        options: ["Canva", "Figma", "Photoshop", "Illustrator", "InDesign", "Premiere Pro", "CapCut", "After Effects", "Lightroom", "Other"],
      },
      {
        id: "commitments",
        type: "paragraph",
        label: "What other commitments will you have this year?",
        required: true,
      },
      {
        id: "weekly_hours",
        type: "short",
        label: "How many hours per week can you commit to WDS?",
        required: true,
        maxLength: 120,
      },
      {
        id: "motivation",
        type: "paragraph",
        label: "Why do you want to be on the Marketing portfolio?",
        required: true,
        maxWords: 200,
      },
      {
        id: "marketing_feedback",
        type: "paragraph",
        label: "Look at our current marketing. What is one thing you would change?",
        required: true,
        maxWords: 100,
      },
      {
        id: "niche_fact",
        type: "paragraph",
        label: "Tell us a niche fact about yourself that you don't usually tell people.",
        required: true,
      },
    ],
  },
];

const FLAGSHIP_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      { id: "name", type: "short", label: "Full name", autoComplete: "name", required: true, maxLength: 120 },
      { id: "email", type: "email", label: "School email", placeholder: "you@uwo.ca", autoComplete: "email", required: true, maxLength: 254 },
      { id: "year", type: "dropdown", label: "Year", placeholder: "select your year", options: ["1", "2", "3", "4", "5+"], required: true },
      { id: "major", type: "short", label: "Major", required: true, maxLength: 200 },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      { id: "motivation", type: "paragraph", label: "Why do you want to join flagship?", required: true },
      { id: "event_experience", type: "paragraph", label: "Tell us about your experience in organizing events.", required: true },
      { id: "spark_idea", type: "paragraph", label: "What’s one thing you would add to spark?", required: true },
    ],
  },
];

const DEVELOPMENT_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      { id: "name", type: "short", label: "Full name", autoComplete: "name", required: true, maxLength: 120 },
      { id: "email", type: "email", label: "Preferred Email", placeholder: "you@example.com", autoComplete: "email", required: true, maxLength: 254 },
      { id: "year", type: "dropdown", label: "Year of Study", placeholder: "select your year", options: ["1", "2", "3", "4", "5+"], required: true },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      { id: "motivation", type: "paragraph", label: "Why should we hire you? How are you different from everyone else applying?", required: true },
      { id: "ml_familiarity", type: "scale", label: "How familiar are you with machine learning concepts, such as neural networks?", min: 1, max: 10, lowLabel: "Not familiar", highLabel: "Very familiar", required: true },
      { id: "programming_familiarity", type: "paragraph", label: "How familiar are you with programming (DSA, full-stack development, etc.)?", description: "Tell us about your skills and any relevant projects or experience.", required: true },
      { id: "github", type: "url", label: "GitHub profile link", placeholder: "https://github.com/yourusername", required: true, maxLength: 2048 },
    ],
  },
];

const TECHNOLOGY_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      { id: "name", type: "short", label: "Full Name", autoComplete: "name", required: true, maxLength: 120 },
      { id: "email", type: "email", label: "Western Email", placeholder: "you@uwo.ca", autoComplete: "email", required: true, maxLength: 254 },
      { id: "year", type: "dropdown", label: "Year", placeholder: "select your year", options: ["1", "2", "3", "4", "5+"], required: true },
      { id: "program", type: "short", label: "Program", required: true, maxLength: 200 },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      { id: "weekly_hours", type: "radio", label: "How much time will you have available this year to participate in WDS activities (as a director)?", options: ["Less than 5 hours a week", "5 - 10 hours a week", "More than 10 hours a week"], required: true },
      { id: "commitments", type: "paragraph", label: "List any other clubs, commitments, or activities you are currently involved in or plan to participate in this year.", required: true },
      { id: "motivation", type: "paragraph", label: "Why do you want to join the Technology Portfolio at WDS, and what would you like to contribute this year?", required: true },
      { id: "project", type: "paragraph", label: "Briefly walk us through a project you built or contributed to that you’re proud of.", required: true },
      { id: "workshop", type: "paragraph", label: "Design a 60-minute technical workshop you would theoretically run for WDS members. Briefly describe the topic, structure, and how you would make it engaging and accessible to students with different levels of experience.", required: true },
      { id: "website_feedback", type: "paragraph", label: "What would you change about the current WDS website?", required: true },
      { id: "hackathons", type: "scale", label: "How many hackathons have you participated in?", options: ["0", "1", "2", "3+", "5+", "7+", "10+", "15+", "20+", "30+"], required: true },
      { id: "tech_opinion", type: "paragraph", label: "What is an unpopular tech opinion or development hill you are willing to die on?", required: true },
      { id: "linkedin", type: "url", label: "LinkedIn", description: "Optional. Share a link to your LinkedIn profile.", placeholder: "https://", maxLength: 2048 },
      { id: "instagram", type: "url", label: "Instagram", description: "Optional. Share a link to your Instagram profile.", placeholder: "https://instagram.com/yourusername", maxLength: 2048 },
      { id: "work_sample", type: "url", label: "Portfolio", description: "Optional. Share a link and make sure reviewers can access it.", placeholder: "https://", maxLength: 2048 },
    ],
  },
];

const INTERNALS_SECTIONS = [
  {
    id: "introduction",
    title: "basic questions",
    questions: [
      { id: "name", type: "short", label: "Full Name", autoComplete: "name", required: true, maxLength: 120 },
      { id: "email", type: "email", label: "Preferred Email", placeholder: "you@example.com", autoComplete: "email", required: true, maxLength: 254 },
      { id: "program", type: "short", label: "Current Program", required: true, maxLength: 200 },
      { id: "year", type: "dropdown", label: "Year of Study", placeholder: "select your year", options: ["1", "2", "3", "4", "5+"], required: true },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio questions",
    questions: [
      { id: "commitments", type: "paragraph", label: "What's your realistic weekly commitment, and what else are you juggling this year? (2 sentences)", required: true },
      { id: "motivation", type: "paragraph", label: "Why Internals at WDS? (3-4 sentences)", required: true },
      { id: "community_event", type: "paragraph", label: "Pitch one community event you'd run this year. Tell us the format, who it's for, and why someone busy would actually show up. (3-4 sentences)", required: true },
      { id: "community", type: "paragraph", label: "Define community. What kind of community do you hope to build in WDS? (3-4 sentences)", required: true },
    ],
  },
];

const PORTFOLIO_SECTIONS = {
  technology: TECHNOLOGY_SECTIONS,
  internals: INTERNALS_SECTIONS,
  careers: CAREERS_SECTIONS,
  marketing: MARKETING_SECTIONS,
  flagship: FLAGSHIP_SECTIONS,
  development: DEVELOPMENT_SECTIONS,
};

// Keep IDs stable: saved answers use them as keys.
export function getApplication(id) {
  if (id === "finance") return null;
  const portfolio = PORTFOLIOS.find((item) => item.id === id);
  if (!portfolio) return null;
  return {
    id,
    label: portfolio.label,
    cycle: "2026–27",
    version: id === "marketing" ? 8 : ["internals", "development"].includes(id) ? 7 : id === "flagship" ? 5 : PORTFOLIO_SECTIONS[id] ? 6 : 4,
    sections: (PORTFOLIO_SECTIONS[id] || [
      {
        id: "introduction",
        title: "basic questions",
        questions: [
          {
            id: "name",
            type: "short",
            label: "Full name",
            placeholder: "your full name",
            autoComplete: "name",
            required: true,
            maxLength: 120,
          },
          {
            id: "email",
            type: "email",
            label: "Email address",
            placeholder: "you@example.com",
            autoComplete: "email",
            required: true,
            maxLength: 254,
          },
          {
            id: "year",
            type: "dropdown",
            label: "Example of dropdown",
            placeholder: "select an option",
            options: ["First year", "Second year", "Third year", "Fourth year", "Fifth year or above", "Graduate studies"],
            required: true,
          },
          {
            id: "experience",
            type: "radio",
            label: "Example of multiple choice",
            options: ["Option one", "Option two", "Option three"],
            required: true,
          },
        ],
      },
      {
        id: "portfolio",
        title: "portfolio questions",
        questions: [
          {
            id: "motivation",
            type: "paragraph",
            label: "Example of paragraph",
            description: `Preview of a ${portfolio.label.toLowerCase()} application question.`,
            placeholder: "example paragraph",
            required: true,
            maxLength: 1200,
          },
          {
            id: "interests",
            type: "checkboxes",
            label: "Example of checkboxes",
            description: "Choose as many as you like.",
            options: INTERESTS[id],
            required: true,
          },
          {
            id: "confidence",
            type: "scale",
            label: "Example of linear scale",
            min: 1,
            max: 5,
            lowLabel: "Minimum",
            highLabel: "Maximum",
            required: true,
          },
          {
            id: "excitement",
            type: "rating",
            label: "Example of rating",
            max: 5,
            required: true,
          },
          {
            id: "work_sample",
            type: "url",
            label: "Work sample link",
            description: "Optional. Share a portfolio, GitHub, or Drive link and make sure reviewers can access it.",
            placeholder: "https://",
            maxLength: 2048,
          },
        ],
      },
      {
        id: "availability",
        title: "grids & scheduling",
        questions: [
          {
            id: "collaboration",
            type: "radioGrid",
            label: "Example of multiple-choice grid",
            description: "Choose one answer in each row.",
            rows: ["Row one", "Row two", "Row three"],
            columns: ["Option one", "Option two", "Option three"],
            required: true,
          },
          {
            id: "availability",
            type: "checkboxGrid",
            label: "Example of checkbox grid",
            description: "Choose at least one answer in each row.",
            rows: ["Weekdays", "Weekends"],
            columns: ["Morning", "Afternoon", "Evening"],
            required: true,
          },
          {
            id: "start_date",
            type: "date",
            label: "Example of date",
            required: true,
          },
          {
            id: "meeting_time",
            type: "time",
            label: "Example of time",
            description: "London, Ontario local time.",
            required: true,
          },
        ],
      },
    ]).map((section) => ({
      ...section,
      questions: [
        ...section.questions,
        ...(section.id === "portfolio" ? [{
          id: "resume",
          type: "file",
          label: "Resume",
          description: "Upload one PDF, maximum 500 KB and 10 pages. Do not include sensitive information you do not want to share publicly.",
          required: true,
          maxBytes: MAX_RESUME_BYTES,
        }] : []),
      ].map((question) => {
        // Preserve explicit word/character limits; sentence guidance can coexist with the word cap.
        if (question.type !== "paragraph" || question.maxWords || question.maxLength) {
          return question;
        }
        return { ...question, maxWords: 300 };
      }),
    })),
  };
}
