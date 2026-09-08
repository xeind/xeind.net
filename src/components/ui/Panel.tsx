import CornerDiamond from "./CornerDiamond";

interface PanelProps {
  children: React.ReactNode;
  edges?: "none" | "top" | "bottom" | "both";
  ornaments?: "none" | "top" | "bottom" | "all";
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export default function Panel({
  children,
  edges = "both",
  ornaments = "all",
  padding = "md",
  className = "",
}: PanelProps) {
  // One padding for every section, headers included. The sm/md/lg ladder came
  // from a pre-grid three-step (px-4/5/6, md:py-6/8/10) that Phase 2 snapped
  // onto the grid without asking what the steps were for — and the answer was
  // nothing: a page header indented 64px while every heading under it sat at
  // 48, which read as a misalignment rather than as emphasis. At the 1024 cap
  // md is now 64px in and 32px down, so the content column is 896 — 56 cells —
  // and identical from the first block to the last.
  //
  // sm and lg have no callers. Left in place rather than removed with the rest
  // of the fallow list; nothing reads them.
  const paddingClasses = {
    sm: "px-4 py-8 sm:px-8 md:py-8",
    md: "px-4 py-8 sm:px-8 md:px-16 md:py-8",
    lg: "px-4 py-8 sm:px-8 md:px-12 md:py-12",
  };

  return (
    <div
      className={`bg-card relative ${paddingClasses[padding]} ${
        edges === "top" || edges === "both"
          ? "before:bg-accent/30 before:absolute before:top-0 before:right-[-9999px] before:left-[-9999px] before:h-px before:content-['']"
          : ""
      } ${
        edges === "bottom" || edges === "both"
          ? // bottom:-1, not 0: the panel ends ON a grid line, so its rule
            // belongs to the pixel after that line — one pixel inside would
            // read as the boundary sitting high. z-10 keeps the stroke over
            // the background of whatever follows (a divider's bg-card), the
            // same trick CalloutLink's owned bottom edge uses; the corner
            // diamonds stay above it at z-20.
            "after:bg-accent/30 after:absolute after:right-[-9999px] after:bottom-[-1px] after:left-[-9999px] after:z-10 after:h-px after:content-['']"
          : ""
      } ${className}`}
    >
      {/* Rails, rules and diamonds are one ink: accent/30 everywhere they
          meet. The rules above were accent/20 for a while, one rung under
          the rails, and the crossing read as three tones — rail 40.9, rule
          35.9, diamond 22.1 measured over the card in Kozo, with the mark
          reading as a gap in the rail rather than a mark on it. The diamond
          went to accent/30 first (2026-08); the rules followed (2026-09-09)
          so the frame reads as one drawn line. A 1px stroke at 45° still
          spreads over 2-3 pixels and reads a touch softer; that is
          rasterisation, not a tone to chase. */}
      {ornaments === "all" ? (
        <CornerDiamond position="all" variant="frame" />
      ) : ornaments === "bottom" ? (
        <>
          <CornerDiamond position="bl" variant="frame" />
          <CornerDiamond position="br" variant="frame" />
        </>
      ) : ornaments === "top" ? (
        <>
          <CornerDiamond position="tl" variant="frame" />
          <CornerDiamond position="tr" variant="frame" />
        </>
      ) : null}
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
    </div>
  );
}
