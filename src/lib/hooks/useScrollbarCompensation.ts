import { useEffect } from "react";

/**
 * Lock body scroll when a modal/popup is open.
 * Layout shift is handled by scrollbar-gutter: stable on <html>.
 */
export function useScrollbarCompensation(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}
