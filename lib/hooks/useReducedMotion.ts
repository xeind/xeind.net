"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion (for accessibility)
 *
 * Uses useSyncExternalStore to avoid hydration mismatches and
 * properly sync with the browser's media query state.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", callback);
        return () => mediaQuery.removeEventListener("change", callback);
      } else {
        mediaQuery.addListener(callback);
        return () => mediaQuery.removeListener(callback);
      }
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
