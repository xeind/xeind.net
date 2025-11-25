interface SectionDividerProps {
  direction?: "right" | "left"; // Direction of diagonal lines
}

export default function SectionDivider({
  direction = "right",
}: SectionDividerProps) {
  // Align with 16px grid: use 8px (half-cell) for tighter diagonal pattern
  const patternSize = 8;
  // Use 1.5px stroke width to match icon system
  const strokeWidth = 1.5;
  // Rotate 45° for right diagonal, -45° for left diagonal
  const rotation = direction === "right" ? 45 : -45;

  return (
    <div className="border-accent/20 bg-card relative -z-10 h-4">
      <svg className="pointer-events-none absolute inset-0 size-full select-none">
        <defs>
          <pattern
            id={`divider-pattern-${direction}`}
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotation})`}
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={patternSize}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-accent/20"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#divider-pattern-${direction})`}
        />
      </svg>
    </div>
  );
}
