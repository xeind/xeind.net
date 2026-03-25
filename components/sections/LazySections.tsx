"use client";

import dynamic from "next/dynamic";
import ExperienceSkeleton from "./ExperienceSkeleton";

// Lazy-loaded ProjectGrid with loading state to prevent CLS.
// This is below-fold content and contains motion animations for modals.
export const ProjectGrid = dynamic(
  () => import("@/components/sections/ProjectGrid"),
  {
    loading: () => <div className="min-h-[400px]" />,
  }
);

// Lazy-loaded ExperienceTimeline - below-fold on most screens
// Contains hover animations and state management
export const ExperienceTimeline = dynamic(
  () => import("@/components/sections/ExperienceTimeline"),
  {
    loading: () => <ExperienceSkeleton />,
  }
);

export default ProjectGrid;
