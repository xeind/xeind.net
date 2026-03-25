"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import StaticLogo from "./StaticLogo";

// Lazy load the interactive version with all the heavy features
const LogoCopyDropdown = lazy(() => import("@/components/LogoCopyDropdown"));

interface SmartLogoProps {
  size?: number;
  className?: string;
}

/**
 * SmartLogo - Performance-optimized logo with progressive enhancement
 *
 * Phase 1 (Immediate): Renders StaticLogo for fast LCP
 * Phase 2 (Background): Preloads LogoCopyDropdown after mount
 * Phase 3 (Interactive): Swaps to full functionality once loaded
 *
 * Performance benefits:
 * - Static logo renders immediately (no JS blocking)
 * - Heavy motion/react chunk loads after initial paint
 * - Seamless swap when ready
 * - Saves ~20-25KB from critical path
 */
export default function SmartLogo({
  size = 64,
  className = "",
}: SmartLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShowInteractive, setShouldShowInteractive] = useState(false);

  useEffect(() => {
    // Preload the interactive component after initial paint
    const preloadTimer = setTimeout(() => {
      // This triggers the dynamic import to start loading
      import("@/components/LogoCopyDropdown").then(() => {
        setIsLoaded(true);
      });
    }, 100); // Small delay to ensure static logo is painted first

    return () => clearTimeout(preloadTimer);
  }, []);

  const handleInteraction = () => {
    // If user interacts before preload completes, show immediately
    if (!shouldShowInteractive) {
      setShouldShowInteractive(true);
    }
  };

  // Show interactive version if:
  // 1. Preload completed and user interacted, OR
  // 2. User interacted before preload (force load)
  if ((isLoaded && shouldShowInteractive) || shouldShowInteractive) {
    return (
      <Suspense
        fallback={
          <button
            className={`m-0 cursor-pointer border-0 bg-transparent p-0 align-middle leading-none ${className}`}
            style={{ width: size, height: size }}
          >
            <StaticLogo size={size} />
          </button>
        }
      >
        <LogoCopyDropdown size={size} className={className} />
      </Suspense>
    );
  }

  // Static version for immediate LCP
  return (
    <button
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      onFocus={handleInteraction}
      className={`m-0 cursor-pointer border-0 bg-transparent p-0 align-middle leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      aria-label="Copy logo as SVG"
    >
      <StaticLogo size={size} />
    </button>
  );
}
