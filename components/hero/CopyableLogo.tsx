"use client";

import { useState, lazy, Suspense } from "react";
import StaticLogo from "./StaticLogo";

// Lazy load the interactive version with all the heavy features
const LogoCopyDropdown = lazy(() => import("@/components/LogoCopyDropdown"));

interface CopyableLogoProps {
  size?: number;
  className?: string;
}

/**
 * CopyableLogo - Logo with copy functionality (lazy-loaded)
 *
 * Phase 1: Renders StaticLogo immediately for fast LCP
 * Phase 2: On hover/click, lazy-loads LogoCopyDropdown with:
 *   - Portal rendering
 *   - Framer Motion animations
 *   - Clipboard API integration
 *   - Sound effects
 *
 * This saves ~20-25KB from initial bundle since motion/react
 * and the dropdown logic are only loaded on interaction.
 */
export default function CopyableLogo({
  size = 64,
  className = "",
}: CopyableLogoProps) {
  const [shouldLoadInteractive, setShouldLoadInteractive] = useState(false);

  const handleInteraction = () => {
    if (!shouldLoadInteractive) {
      setShouldLoadInteractive(true);
    }
  };

  if (shouldLoadInteractive) {
    return (
      <Suspense
        fallback={
          <div style={{ width: size, height: size }}>
            <StaticLogo size={size} className={className} />
          </div>
        }
      >
        <LogoCopyDropdown size={size} className={className} />
      </Suspense>
    );
  }

  // Wrap static logo in button-like div for interaction detection
  return (
    <div
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      onFocus={handleInteraction}
      className={`cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Load logo copy functionality"
      style={{ display: "inline-block" }}
    >
      <StaticLogo size={size} />
    </div>
  );
}
