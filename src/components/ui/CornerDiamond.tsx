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
// edge, half over paper and half over card, so it takes both — see FRAME_FILL.
const variantFills = {
  default: "bg-card",
  accent: "bg-card",
  frame: "",
};

// A frame mark is cut in half by the rail it sits on: paper outside the sheet,
// card inside. One flat colour is wrong on one half by the distance between the
// two tokens — 16 levels in Nightingale, 20 in Kozo — and it drags the border
// with it, because background paints to the border box. Measured in
// Nightingale: the rail is accent/30 over card at (74,84,61), while the same
// border over a muted-filled mark composited to (63,73,50). The mark's stroke
// read 11 levels below the rail it terminates.
//
// The span is rotate-45, so a gradient in its own box comes out 45° clockwise
// on screen. 45deg local is therefore 90deg painted — a vertical seam down the
// mark's centre, first stop on the left. Which side is paper depends only on
// which rail the corner belongs to: tl/bl sit on the left rail, tr/br the
// right.
const PAPER = "var(--color-muted)"; // what .paper-background uses
const CARD = "var(--color-card)";
const FRAME_FILL = {
  tl: `linear-gradient(45deg, ${PAPER} 50%, ${CARD} 50%)`,
  bl: `linear-gradient(45deg, ${PAPER} 50%, ${CARD} 50%)`,
  tr: `linear-gradient(45deg, ${CARD} 50%, ${PAPER} 50%)`,
  br: `linear-gradient(45deg, ${CARD} 50%, ${PAPER} 50%)`,
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

  const fill = (corner: "tl" | "tr" | "bl" | "br") =>
    variant === "frame" ? { background: FRAME_FILL[corner] } : {};

  if (position === "all") {
    return (
      <>
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <span
            key={corner}
            className={baseClass}
            style={{
              width: size,
              height: size,
              ...fill(corner),
              ...positions[corner],
              ...style,
            }}
          />
        ))}
      </>
    );
  }

  return (
    <span
      className={baseClass}
      style={{
        width: size,
        height: size,
        ...fill(position),
        ...positions[position],
        ...style,
      }}
    />
  );
}
