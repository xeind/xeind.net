"use client";

import { CSS_TRANSITIONS } from "@/lib/config/animation";
import { GAP_SPACING } from "@/lib/config/spacing";
import { useClickSound } from "@/lib/hooks";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  download?: boolean | string;
  badge?: string; // Optional badge text (e.g., "D", "↓", "⌘K")
  target?: string;
  rel?: string;
}

export default function Button({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  download,
  badge,
  target,
  rel,
}: ButtonProps) {
  const { clickLow, tap } = useClickSound();
  const Component = href ? "a" : "button";
  const props = href
    ? {
        href,
        ...(download && { download }),
        // Default to opening in new tab if target not specified
        target: target || "_blank",
        // Default to noopener noreferrer for security if rel not specified
        rel: rel || "noopener noreferrer",
      }
    : { type, disabled };

  return (
    <Component
      onMouseEnter={tap}
      onClick={() => {
        clickLow();
        onClick?.();
      }}
      className={`bg-card group relative inline-flex items-center justify-center gap-3 px-4 md:px-12 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={CSS_TRANSITIONS.border}
      {...props}
    >
      {/* All 4 borders - dashed, become solid on hover */}
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 border-t border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 border-r border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 border-l border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />

      {/* Camera focus corners - L-shaped brackets (above borders, 1px thin) */}
      {/* Top-Left Corner */}
      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>

      {/* Top-Right Corner */}
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>

      {/* Bottom-Left Corner */}
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>

      {/* Bottom-Right Corner */}
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>

      {/* Center-focused gradient background layers (like CalloutLink) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Default state: center glow gradient (0-15-40-60-40-15-0) */}
        <div
          className="bg-accent/20 absolute inset-0 transition-opacity group-hover:opacity-0 group-active:opacity-0"
          style={{
            ...CSS_TRANSITIONS.border,
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
          }}
        />
        {/* Hover state: full fill at 30% opacity */}
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30 group-active:opacity-0"
          style={CSS_TRANSITIONS.border}
        />
        {/* Active/Tap state: inverted center gradient - edges bright, center dark, edges not transparent */}
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-active:opacity-100"
          style={{
            ...CSS_TRANSITIONS.fade,
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex items-center justify-center gap-3 ${GAP_SPACING.xs}`}
      >
        <span
          className="font-serif text-sm transition-all"
          style={CSS_TRANSITIONS.border}
        >
          {children}
        </span>
        {badge && (
          <span
            className="bg-accent/10 text-accent-hover/90 group-hover:text-tertiary group-hover:ring-tertiary/30 ring-accent/30 px-1.5 py-0.5 font-mono text-xs ring-1 transition-all"
            style={CSS_TRANSITIONS.border}
          >
            {badge}
          </span>
        )}
      </div>
    </Component>
  );
}
