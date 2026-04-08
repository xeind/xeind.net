import CornerDiamond from "./CornerDiamond";

interface PanelProps {
  children: React.ReactNode;
  edges?: "none" | "top" | "bottom" | "both";
  ornaments?: "none" | "top" | "bottom" | "all";
  tone?: "default" | "hero";
  padding?: "sm" | "md" | "lg";
  showGrid?: boolean;
  className?: string;
  /** @deprecated Use `edges` instead. */
  hideTopBorder?: boolean;
  /** @deprecated Use `ornaments` instead. */
  bottomDiamondsOnly?: boolean;
}

export default function Panel({
  children,
  edges,
  ornaments,
  tone = "default",
  padding = "md",
  showGrid = false,
  hideTopBorder = false,
  bottomDiamondsOnly = false,
  className = "",
}: PanelProps) {
  const resolvedEdges = edges ?? (hideTopBorder ? "bottom" : "both");
  const resolvedOrnaments =
    ornaments ?? (bottomDiamondsOnly ? "bottom" : "all");

  const paddingClasses = {
    sm: "px-4 py-5 sm:px-6 md:px-8 md:py-6",
    md: "px-5 py-6 sm:px-8 md:px-12 md:py-8",
    lg: "px-6 py-7 sm:px-10 md:px-14 md:py-10",
  };

  const toneClasses = {
    default: "bg-card",
    hero: "bg-card",
  };

  return (
    <div
      className={`${toneClasses[tone]} relative ${paddingClasses[padding]} ${
        resolvedEdges === "top" || resolvedEdges === "both"
          ? "before:bg-accent/20 before:absolute before:top-0 before:right-[-9999px] before:left-[-9999px] before:h-px before:content-['']"
          : ""
      } ${
        resolvedEdges === "bottom" || resolvedEdges === "both"
          ? "after:bg-accent/20 after:absolute after:right-[-9999px] after:bottom-0 after:left-[-9999px] after:h-px after:content-['']"
          : ""
      } ${className}`}
    >
      {resolvedOrnaments === "bottom" ? (
        <>
          <CornerDiamond position="bl" variant="accent" />
          <CornerDiamond position="br" variant="accent" />
        </>
      ) : resolvedOrnaments === "top" ? (
        <>
          <CornerDiamond position="tl" variant="accent" />
          <CornerDiamond position="tr" variant="accent" />
        </>
      ) : (
        <CornerDiamond position="all" variant="accent" />
      )}
      {showGrid && (
        <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-20" />
      )}
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
