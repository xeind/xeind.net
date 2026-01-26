import CornerDiamond from "./CornerDiamond";

interface SectionBlockProps {
  children: React.ReactNode;
  showGrid?: boolean;
  hideTopBorder?: boolean;
  bottomDiamondsOnly?: boolean;
}

export default function SectionBlock({
  children,
  showGrid = false,
  hideTopBorder = false,
  bottomDiamondsOnly = false,
}: SectionBlockProps) {
  return (
    <div
      className={`bg-card after:bg-accent/20 relative px-12 py-8 after:absolute after:right-[-9999px] after:bottom-0 after:left-[-9999px] after:h-px after:content-[''] ${
        hideTopBorder
          ? ""
          : "before:bg-accent/20 before:absolute before:top-0 before:right-[-9999px] before:left-[-9999px] before:h-px before:content-['']"
      }`}
    >
      {bottomDiamondsOnly ? (
        <>
          <CornerDiamond position="bl" variant="accent" />
          <CornerDiamond position="br" variant="accent" />
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
