import { DURATION, EASING } from "@/lib/config/animation";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted";
  className?: string;
}

/**
 * Badge - Tech stack tags and metadata labels
 *
 * Design Pattern:
 * - Sharp corners (no border-radius)
 * - Dashed border (matches button/link design system)
 * - Monospace font (technical aesthetic)
 * - Small, compact for inline use
 *
 * Variants:
 * - default: Subtle gray (for metadata)
 * - accent: Accent color (for emphasis)
 * - muted: Very subtle (for secondary info)
 *
 * Usage:
 *   <Badge>TypeScript</Badge>
 *   <Badge variant="accent">Featured</Badge>
 */
export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "border-accent/30 text-foreground/70",
    accent: "border-accent/40 text-accent",
    muted: "border-foreground/20 text-foreground/50",
  };

  return (
    <span
      className={`bg-card bg-accent/8 relative inline-flex min-h-[1.25rem] items-center justify-center gap-2 border border-dashed px-2 py-0.5 font-mono text-[0.6875rem] leading-tight transition-[background-color,border-color,color,opacity] ${variantStyles[variant]} ${className} `}
      style={{
        transitionDuration: `${DURATION.normal}s`,
        transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
      }}
    >
      {children}
    </span>
  );
}
