import { PORTFOLIOS } from "@/components/sections/Portfolios/portfolioData";

const INTERESTS = {
  technology: ["Web development", "Technical workshops", "Hackathon team"],
  marketing: ["Graphic design", "Social media", "Photo & video"],
  development: ["Project planning", "Building products", "Team leadership"],
  internals: ["Team socials", "Member experience", "Merchandise"],
  careers: ["Workshops", "Industry outreach", "Networking events"],
  externals: ["Sponsorships", "Event logistics", "Partnerships"],
  finance: ["Budgeting", "Record keeping", "Financial reporting"],
};

// Keep IDs stable: saved answers use them as keys.
export function getApplication(id) {
  const portfolio = PORTFOLIOS.find((item) => item.id === id);
  if (!portfolio) return null;
  return {
    id,
    label: portfolio.label,
    cycle: "2026–27",
    version: 1,
    sections: [
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
            description: "Optional. Share an HTTPS portfolio, GitHub, or Drive link and make sure reviewers can access it.",
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
    ],
  };
}
