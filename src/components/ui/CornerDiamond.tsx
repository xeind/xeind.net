interface CornerDiamondProps {
  position?: "tl" | "tr" | "bl" | "br" | "all";
  size?: number;
  className?: string;
  variant?: "default" | "accent" | "frame";
  // Merged after the computed size and offsets, so a caller can hand the mark
  // the same transition its edges use and have the whole boundary light as one.
  style?: React.CSSProperties;
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

// The fill is load-bearing, not decoration. Every hairline here is alpha, so two
// of them crossing composite: in Kozo a rule reads 206, and the same rule under
// an unfilled diamond arm reads 160. An opaque fill covers the rail and the rule
// under the whole mark — background paints to the border box, so it sits under
// the border too — and the arms blend over the fill instead of over the lines.
// Nothing doubles.
//
// Each variant takes the surface it sits on. `default` and `accent` are drawn
// inside the sheet, so they take the card. `frame` straddles the sheet's outer
// edge, half over paper and half over card, and no single colour is right on
// both sides — it takes the paper (--color-muted, what .paper-background uses,
// not --color-background, which nothing near a diamond ever shows).
//
// One flat colour, and the mark stays one shape. A split gradient matching both
// halves was built twice and rejected twice: it measures exact on both sides,
// and that is the problem — the inner half dissolves into the card and the mark
// reads as a wedge instead of a diamond. Owner's call, 2026-08-18. The fill's
// job is to stop the hairlines doubling, not to disappear.
const variantFills = {
  default: "bg-card",
  accent: "bg-card",
  frame: "bg-muted",
};

export default function CornerDiamond({
  position = "all",
  size = 8,
  className = "",
  variant = "default",
  style,
}: CornerDiamondProps) {
  const baseClass = `edge-glow-node absolute z-20 rotate-45 rounded-[1px] border ${variantBorders[variant]} ${variantFills[variant]} ${className}`;

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
            style={{ width: size, height: size, ...positions[corner], ...style }}
          />
        ))}
      </>
    );
  }

  const pos = positions[position];

  return <span className={baseClass} style={{ width: size, height: size, ...pos, ...style }} />;
}
