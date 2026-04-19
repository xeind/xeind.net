import dynamic from "next/dynamic";

// Lazy-loaded ProjectGrid with loading state to prevent CLS.
// This is below-fold content and contains motion animations for modals.
export const ProjectGrid = dynamic(
  () => import("@/components/sections/ProjectGrid"),
  {
    loading: () => <div className="min-h-[400px]" />,
  }
);

export default ProjectGrid;
