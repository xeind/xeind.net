interface SectionDividerProps {
  variant?: "dashed" | "grid" | "grid-broken";
}

export default function SectionDivider({
  variant = "dashed",
}: SectionDividerProps) {
  if (variant === "grid") {
    return (
      <div className="relative -z-10 overflow-hidden" style={{ height: "20px" }}>
        <div className="divider-grid absolute inset-x-0" style={{ top: "1px", bottom: "1px" }} />
      </div>
    );
  }

  if (variant === "grid-broken") {
    return (
      <div className="relative -z-10 overflow-hidden" style={{ height: "20px" }}>
        <div className="divider-grid-broken absolute inset-x-0" style={{ top: "1px", bottom: "1px" }} />
      </div>
    );
  }

  return (
    <div className="bg-card relative -z-10 h-4 overflow-hidden">
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
