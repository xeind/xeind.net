"use client";

import dynamic from "next/dynamic";

// Lazy-loaded ProjectGrid with loading state to prevent CLS.
// This is below-fold content and contains motion animations for modals.
// About and Experience sections are imported directly in app/page.tsx
// because they are above-fold and should render immediately.
export const ProjectGrid = dynamic(
  () => import("@/components/sections/ProjectGrid"),
  {
    loading: () => <div className="min-h-[400px]" />,
  }
);

export default ProjectGrid;
