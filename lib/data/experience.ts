import type { Experience } from "../types";

export const experiences: Experience[] = [
  {
    id: "exp-1",
    company: "Your Company Name",
    role: "Senior Full-Stack Developer",
    location: "Remote",
    period: {
      start: "Jan 2023",
      end: "Present",
    },
    achievements: [
      "Led development of scalable web applications serving 100K+ users",
      "Architected microservices infrastructure reducing deployment time by 60%",
      "Mentored team of 5 junior developers on best practices and code quality",
      "Implemented CI/CD pipelines improving release frequency by 3x",
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
  },
  {
    id: "exp-2",
    company: "Previous Company",
    role: "Full-Stack Developer",
    location: "Philippines",
    period: {
      start: "Jun 2021",
      end: "Dec 2022",
    },
    achievements: [
      "Built responsive web applications with React and Next.js",
      "Optimized database queries reducing response time by 40%",
      "Collaborated with design team to implement pixel-perfect UIs",
      "Integrated third-party APIs and payment gateways",
    ],
    technologies: ["React", "Next.js", "Express", "MongoDB", "Tailwind CSS"],
  },
  {
    id: "exp-3",
    company: "First Company",
    role: "Junior Developer",
    location: "Philippines",
    period: {
      start: "Jan 2020",
      end: "May 2021",
    },
    achievements: [
      "Developed and maintained client-facing web applications",
      "Fixed critical bugs and implemented feature requests",
      "Participated in code reviews and agile development processes",
      "Created comprehensive documentation for internal tools",
    ],
    technologies: ["JavaScript", "Vue.js", "PHP", "MySQL"],
  },
];
