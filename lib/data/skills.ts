import { Skill } from "@/lib/types";

export const skills: Skill[] = [
  { name: "TypeScript", category: "language", proficiency: "expert" },
  { name: "React", category: "framework", proficiency: "expert" },
  { name: "Rust", category: "language", proficiency: "advanced" },
  { name: "Next.js", category: "framework", proficiency: "expert" },
  { name: "Python", category: "language", proficiency: "advanced" },
  { name: "Go", category: "language", proficiency: "intermediate" },
  { name: "Bun", category: "tool", proficiency: "advanced" },
  { name: "Docker", category: "tool", proficiency: "advanced" },
  { name: "PostgreSQL", category: "database", proficiency: "advanced" },
];

// Helper functions for filtering
export const getSkillsByCategory = (category: Skill["category"]) => {
  return skills.filter((skill) => skill.category === category);
};

export const getFeaturedSkills = () => {
  return skills.filter((skill) => skill.proficiency === "expert");
};

export const getSkillNames = () => {
  return skills.map((skill) => skill.name);
};
