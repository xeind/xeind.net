interface SectionDividerProps {
  variant?: "dashed" | "grid" | "grid-broken";
}

const HORIZONTAL_ACCENT_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 37.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 62.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)";

function DividerAccent() {
  return (
    <div
      className="bg-accent/20 pointer-events-none absolute inset-0"
      style={{
        maskImage: HORIZONTAL_ACCENT_MASK,
        WebkitMaskImage: HORIZONTAL_ACCENT_MASK,
      }}
    />
  );
}

export default function SectionDivider({
  variant = "dashed",
}: SectionDividerProps) {
  if (variant === "grid") {
    return (
      <div
        className="edge-glow-shell edge-glow-shell-horizontal relative"
        style={{ height: "20px" }}
      >
        <DividerAccent />
        <div
          className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
          style={{ top: "1px" }}
          aria-hidden="true"
        />
        <div
          className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
          style={{ bottom: "1px" }}
          aria-hidden="true"
        />
        <div className="divider-grid absolute inset-x-0" style={{ top: "1px", bottom: "1px" }} />
      </div>
    );
  }

  if (variant === "grid-broken") {
    return (
      <div
        className="edge-glow-shell edge-glow-shell-horizontal relative"
        style={{ height: "20px" }}
      >
        <DividerAccent />
        <div
          className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
          style={{ top: "1px" }}
          aria-hidden="true"
        />
        <div
          className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
          style={{ bottom: "1px" }}
          aria-hidden="true"
        />
        <div className="divider-grid-broken absolute inset-x-0" style={{ top: "1px", bottom: "1px" }} />
      </div>
    );
  }

  return (
    <div className="edge-glow-shell edge-glow-shell-horizontal bg-card relative h-4">
      <DividerAccent />
      <div
        className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
        style={{ top: "0" }}
        aria-hidden="true"
      />
      <div
        className="edge-glow-line absolute right-[-9999px] left-[-9999px] z-10 h-px"
        style={{ bottom: "0" }}
        aria-hidden="true"
      />
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(-4px)",
        }}
      />
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(0px)",
        }}
      />
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(4px)",
        }}
      />
    </div>
  );
}
