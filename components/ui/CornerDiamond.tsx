interface CornerDiamondProps {
  position?: "tl" | "tr" | "bl" | "br" | "all";
  size?: number;
  className?: string;
  variant?: "default" | "accent";
}

export default function CornerDiamond({
  position = "all",
  size = 8,
  className = "",
  variant = "default",
}: CornerDiamondProps) {
  const baseClass =
    variant === "accent"
      ? `absolute z-10 rotate-45 rounded-[1px] border border-accent/20 bg-card ${className}`
      : `absolute z-10 rotate-45 rounded-[1px] border border-border bg-card ${className}`;

  // Different offsets for visual alignment with rotated square
  const topOffset = "-3.5px"; // Top/bottom positioning
  const sideOffset = "-4.5px"; // Left/right positioning

  if (position === "all") {
    return (
      <>
        {/* Top-left */}
        <span
          className={baseClass}
          style={{
            width: size,
            height: size,
            top: topOffset,
            left: sideOffset,
          }}
        />
        {/* Top-right */}
        <span
          className={baseClass}
          style={{
            width: size,
            height: size,
            top: topOffset,
            right: sideOffset,
          }}
        />
        {/* Bottom-left */}
        <span
          className={baseClass}
          style={{
            width: size,
            height: size,
            bottom: topOffset,
            left: sideOffset,
          }}
        />
        {/* Bottom-right */}
        <span
          className={baseClass}
          style={{
            width: size,
            height: size,
            bottom: topOffset,
            right: sideOffset,
          }}
        />
      </>
    );
  }

  const positions = {
    tl: { top: topOffset, left: sideOffset },
    tr: { top: topOffset, right: sideOffset },
    bl: { bottom: topOffset, left: sideOffset },
    br: { bottom: topOffset, right: sideOffset },
  };

  const pos = positions[position];

  return (
    <span className={baseClass} style={{ width: size, height: size, ...pos }} />
  );
}
