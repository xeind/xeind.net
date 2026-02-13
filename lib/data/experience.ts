import type { Experience } from "../types";

export const experiences: Experience[] = [
  {
    id: "exp-3",
    company: "Pioneer Dev AI",
    companyUrl: "https://www.pioneerdev.ai/",
    role: "Full-Stack Engineer",
    location: "Boulder, Colorado",
    period: {
      start: "Dec 2025",
      end: "Now",
    },
    description:
      "Primarily building UI with full-stack features for our services",
    technologies: ["TypeScript", "React", "Prisma"],
  },
  {
    id: "exp-2",
    company: "ChatGenie",
    companyUrl: "https://www.chatgenie.ph/",
    role: "Full-Stack Developer – Intern",
    location: "Pasig City, Metro Manila",
    period: {
      start: "Aug 2025",
      end: "Sep 2025",
    },
    description:
      "Trained in advanced Gen AI prompting techniques including chain-of-thought and multi-agent systems, and explored Azure AI services for model deployment",
    technologies: ["Ruby on Rails", "Vue.js", "GraphQL"],
  },
  {
    id: "exp-1",
    company: "Creative Dynamix, Inc.",
    companyUrl: "https://www.cdynamix.net/",
    role: "Developer – Intern",
    location: "Pasig City, Metro Manila",
    period: {
      start: "Aug 2024",
      end: "Sep 2024",
    },
    description:
      "Worked as an Intern, developing and maintaining finance modules in Microsoft Dynamics 365 using X++, resolving bugs and optimizing workflows",
    technologies: ["Microsoft Dynamics 365", "X++"],
  },
];
