interface DimensionLineProps {
  label: string;
  className?: string;
}

/** One end cap, drawn as a small SVG so its stroke row (y 7.5..8.5) lines
 * up exactly with the 1px dimension line. */
function EndCap({ side }: { side: "left" | "right" }) {
  return (
    <svg
      width="9"
      height="16"
      viewBox="0 0 9 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute top-0 ${side === "left" ? "left-[-4px]" : "right-[-4px]"}`}
      aria-hidden="true"
    >
      <line
        x1="4.5"
        y1="2"
        x2="4.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/** Measurement annotation: |——— label ———| spanning its container's width.
 * Decorative — hidden from assistive tech. To measure something wider than
 * the local content box (e.g. the full column inside a padded Panel), wrap
 * it in a div with negative margins. */
export default function DimensionLine({
  label,
  className = "",
}: DimensionLineProps) {
  return (
    <div
      className={`text-accent/60 relative flex h-4 w-full items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {/* Dimension line — same 7.5..8.5 row the cap strokes occupy */}
      <div className="bg-accent/30 absolute inset-x-0 top-[7.5px] h-px" />
      <EndCap side="left" />
      <EndCap side="right" />
      {/* Label sits on the line, masking it */}
      <span className="bg-card text-foreground/50 relative z-10 px-2 font-mono text-[0.625rem] tracking-wide">
        {label}
      </span>
    </div>
  );
}
