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
      <div className="bg-card relative -z-10 h-4 overflow-hidden">
        <svg
          className="text-accent/20 absolute inset-0 h-full w-full"
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="divider-grid-broken-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0.5 0V8M0 0.5H8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 2"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
            <linearGradient
              id="divider-grid-broken-fade"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="12%" stopColor="white" stopOpacity="1" />
              <stop offset="88%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="divider-grid-broken-mask">
              <rect
                x="0"
                y="0"
                width="100"
                height="16"
                fill="url(#divider-grid-broken-fade)"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100"
            height="16"
            fill="url(#divider-grid-broken-pattern)"
            mask="url(#divider-grid-broken-mask)"
          />
        </svg>
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
