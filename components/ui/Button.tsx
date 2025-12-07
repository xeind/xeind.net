"use client";

import { motion } from "motion/react";
import { DURATION, EASING } from "@/lib/config";
import { GAP_SPACING } from "@/lib/config/spacing";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  download?: boolean | string;
  badge?: string; // Optional badge text (e.g., "D", "↓", "⌘K")
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
}: ButtonProps) {
  const Component = href ? motion.a : motion.button;
  const props = href
    ? { href, ...(download && { download }) }
    : { type, disabled };

  return (
    <Component
      onClick={onClick}
      className={`bg-card group relative inline-block px-12 py-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        transitionDuration: `${DURATION.normal}s`,
        transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
      }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{
        duration: DURATION.normal,
      }}
      {...props}
    >
      {/* All 4 borders - dashed, become solid on hover */}
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 border-t border-dashed transition-all group-hover:border-solid"
        style={{
          transitionDuration: `${DURATION.normal}s`,
          transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        }}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 border-r border-dashed transition-all group-hover:border-solid"
        style={{
          transitionDuration: `${DURATION.normal}s`,
          transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        }}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={{
          transitionDuration: `${DURATION.normal}s`,
          transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        }}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 border-l border-dashed transition-all group-hover:border-solid"
        style={{
          transitionDuration: `${DURATION.normal}s`,
          transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        }}
      />

      {/* Camera focus corners - L-shaped brackets (above borders, 1px thin) */}
      {/* Top-Left Corner */}
      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      {/* Top-Right Corner */}
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      {/* Bottom-Left Corner */}
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      {/* Bottom-Right Corner */}
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      {/* Center-focused gradient background layers (like CalloutLink) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Default state: center glow gradient (0-15-40-60-40-15-0) */}
        <div
          className="bg-accent/20 absolute inset-0 transition-opacity group-hover:opacity-0"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
          }}
        />
        {/* Hover state: full fill at 30% opacity */}
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex items-center justify-center ${GAP_SPACING.xs}`}
      >
        <span
          className="font-serif text-sm transition-all [text-shadow:0px_1px_1.5px_rgba(0,0,0,0.16)]"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        >
          {children}
        </span>
        {badge && (
          <span
            className="bg-accent/10 text-accent-hover/90 group-hover:text-tertiary group-hover:ring-tertiary/30 ring-accent/30 px-1.5 py-0.5 font-mono text-xs ring-1 transition-all"
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </Component>
  );
}
