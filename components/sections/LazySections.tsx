"use client";

import dynamic from "next/dynamic";

// Lazy-loaded sections with loading states to prevent CLS.
// These are client components but still SSR to avoid layout shift.
export const ProjectGrid = dynamic(
  () => import("@/components/sections/ProjectGrid"),
  {
    loading: () => <div className="min-h-[400px]" />,
  },
);

export const ExperienceTimeline = dynamic(
  () => import("@/components/sections/ExperienceTimeline"),
  {
    loading: () => <div className="min-h-[600px]" />,
  },
);

export const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection"),
  {
    loading: () => <div className="min-h-[200px]" />,
  },
);

export default ProjectGrid;
