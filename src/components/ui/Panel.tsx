import CornerDiamond from "./CornerDiamond";

interface PanelProps {
  children: React.ReactNode;
  edges?: "none" | "top" | "bottom" | "both";
  ornaments?: "none" | "top" | "bottom" | "all";
  padding?: "sm" | "md" | "lg";
  showGrid?: boolean;
  showNoise?: boolean;
  className?: string;
}

export default function Panel({
  children,
  edges = "both",
  ornaments = "all",
  padding = "md",
  showGrid = false,
  showNoise = false,
  className = "",
}: PanelProps) {
  const paddingClasses = {
    sm: "px-4 py-5 sm:px-6 md:px-8 md:py-6",
    md: "px-5 py-6 sm:px-8 md:px-12 md:py-8",
    lg: "px-6 py-7 sm:px-10 md:px-14 md:py-10",
  };

  return (
    <div
      className={`bg-card relative ${paddingClasses[padding]} ${
        edges === "top" || edges === "both"
          ? "before:bg-accent/20 before:absolute before:top-0 before:right-[-9999px] before:left-[-9999px] before:h-px before:content-['']"
          : ""
      } ${
        edges === "bottom" || edges === "both"
          ? "after:bg-accent/20 after:absolute after:right-[-9999px] after:bottom-0 after:left-[-9999px] after:h-px after:content-['']"
          : ""
      } ${className}`}
    >
      {ornaments === "all" ? (
        <CornerDiamond position="all" variant="accent" />
      ) : ornaments === "bottom" ? (
        <>
          <CornerDiamond position="bl" variant="accent" />
          <CornerDiamond position="br" variant="accent" />
        </>
      ) : ornaments === "top" ? (
        <>
          <CornerDiamond position="tl" variant="accent" />
          <CornerDiamond position="tr" variant="accent" />
        </>
      ) : null}
      {showNoise && (
        <div
          className="pointer-events-none absolute inset-0 opacity-(--noise-opacity)"
          style={{
            backgroundImage: "url(/noise.svg)",
            backgroundSize: "180px 180px",
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
      )}
      {showGrid && <div className="bg-hero-grid pointer-events-none absolute inset-0 opacity-20" />}
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
    </div>
  );
}
