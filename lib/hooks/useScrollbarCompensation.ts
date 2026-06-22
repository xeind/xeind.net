import { useEffect } from "react";

/**
 * Universal scrollbar compensation for popups/modals
 * Prevents layout shift when overflow:hidden is applied
 */
export function useScrollbarCompensation(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent scroll without changing the root stacking/compositing context.
      document.body.style.overflow = "hidden";

      // Set CSS variable for fixed elements to use
      document.documentElement.style.setProperty(
        "--scrollbar-width",
        `${scrollbarWidth}px`
      );

      // Compensate body for scrollbar removal
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Restore everything
      document.body.style.overflow = "";
      document.documentElement.style.removeProperty("--scrollbar-width");
      document.body.style.paddingRight = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.removeProperty("--scrollbar-width");
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);
}
