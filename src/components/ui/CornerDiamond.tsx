interface CornerDiamondProps {
  position?: "tl" | "tr" | "bl" | "br" | "all";
  size?: number;
  className?: string;
  variant?: "default" | "accent" | "frame";
}

const variantBorders = {
  default: "border-border",
  accent: "border-accent/20",
  // `frame` is any mark that sits ON the sheet's outer edge — the page frame
  // itself, and every Panel corner, since a Panel spans the sheet. It matches
  // the rails at accent/30 rather than the accent/20 of the rules drawn
  // inside. See the note above the ornaments in Panel.tsx for the measurements.
  frame: "border-accent/30",
};

export default function CornerDiamond({
  position = "all",
  size = 8,
  className = "",
  variant = "default",
}: CornerDiamondProps) {
  const baseClass = `edge-glow-node absolute z-20 rotate-45 rounded-[1px] border ${variantBorders[variant]} bg-card ${className}`;

  // A diamond marks where two hairlines cross, so its centre must land on the
  // stroke, not beside it. Every hairline on this site is the pixel AFTER its
  // boundary — a box that ends on a grid line draws its rule at bottom:-1 /
  // right:-1, outside itself, so the stroke sits on the line instead of one
  // pixel inside. The two offsets encode that: an 8px square rotated 45° has
  // its centre 4px in, so -3.5 puts the centre half a pixel past a leading
  // edge (top/left) and -4.5 half a pixel past a trailing one (bottom/right).
  const leadOffset = "-3.5px"; // top / left
  const trailOffset = "-4.5px"; // bottom / right

  const positions = {
    tl: { top: leadOffset, left: leadOffset },
    tr: { top: leadOffset, right: trailOffset },
    bl: { bottom: trailOffset, left: leadOffset },
    br: { bottom: trailOffset, right: trailOffset },
  };

  if (position === "all") {
    return (
      <>
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <span
            key={corner}
            className={baseClass}
            style={{ width: size, height: size, ...positions[corner] }}
          />
        ))}
      </>
    );
  }

  const pos = positions[position];

  return <span className={baseClass} style={{ width: size, height: size, ...pos }} />;
}
