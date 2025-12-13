import type { Experience } from "../types";

export const experiences: Experience[] = [
  {
    id: "exp-1",
    company: "ChatGenie.PH (Techstars '23)",
    role: "Full Stack Developer – Intern",
    location: "Remote",
    period: {
      start: "Aug 2025",
      end: "Sep 2025",
    },
    achievements: [
      "Trained in advanced Gen AI prompting techniques, including chain-of-thought, multi-agent, and structured output",
      "Explored Azure AI services through guided workshops, gaining insight into model deployment and management",
      "Built GraphQL APIs in Ruby on Rails and integrated Vue.js components for AI-driven client workflows",
    ],
    technologies: ["Ruby", "Ruby on Rails", "Vue.js", "GraphQL"],
  },
  {
    id: "exp-2",
    company: "Creative Dynamix, Inc.",
    role: "Developer – Intern",
    location: "Remote",
    period: {
      start: "Aug 2024",
      end: "Sep 2024",
    },
    achievements: [
      "Engineered finance module features in X++ (C#/SQL blend) within Microsoft Dynamics 365",
      "Resolved critical bug tickets and optimized custom modules, collaborating with co-interns to ensure alignment",
      "Collaborated with co-interns to debug issues and align codebases for the new module to roll-out",
      "Streamlined workflows by automating address synchronization across forms and enforcing safe record deletion",
    ],
    technologies: ["Microsoft Dynamics 365", "X++"],
  },
];
