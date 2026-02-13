import { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "building-a-personal-site-with-nextjs",
    title: "Building a Personal Site with Next.js",
    date: "2025-01-15",
    excerpt:
      "A deep dive into the design decisions and technical choices behind building a portfolio site with Next.js, Tailwind CSS, and a sharp, editorial aesthetic.",
    tags: ["Next.js", "Tailwind CSS", "Design"],
  },
  {
    slug: "typescript-patterns-i-keep-coming-back-to",
    title: "TypeScript Patterns I Keep Coming Back To",
    date: "2024-12-03",
    excerpt:
      "Practical TypeScript patterns that have proven their worth across projects — discriminated unions, branded types, and builder patterns.",
    tags: ["TypeScript", "Patterns"],
  },
  {
    slug: "on-simplicity-in-software",
    title: "On Simplicity in Software",
    date: "2024-11-20",
    excerpt:
      "Why the best code is often the least clever, and how restraint in engineering leads to systems that actually last.",
    tags: ["Engineering", "Opinion"],
  },
];
