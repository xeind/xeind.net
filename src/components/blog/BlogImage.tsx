"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { SPRING_CONFIG, CSS_TRANSITIONS } from "@/lib/config/animation";
import { ICON_CONFIG } from "@/lib/config/design";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useScrollbarCompensation } from "@/lib/hooks/useScrollbarCompensation";

interface BlogImageProps {
  src: string;
  alt: string;
}

export default function BlogImage({ src, alt }: BlogImageProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useScrollbarCompensation(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleClose = useCallback(() => setOpen(false), []);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : SPRING_CONFIG.noBounce;

  return (
    <>
      <figure className="mx-auto my-6 max-w-xl">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-accent/30 bg-card group focus-visible:ring-accent focus-visible:ring-offset-background relative block w-full cursor-zoom-in border border-dashed p-1 transition-colors hover:border-solid focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          style={CSS_TRANSITIONS.border}
        >
          <img src={src} alt={alt} loading="lazy" className="block w-full" />
        </button>
        {alt && (
          <figcaption className="text-foreground/50 mt-2 text-center font-mono text-xs">
            {alt}
          </figcaption>
        )}
      </figure>

      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="fixed inset-0 z-[9998] bg-black/60"
                  onClick={handleClose}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {open && (
                <div
                  className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-6"
                  onClick={handleClose}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={transition}
                    className="pointer-events-auto relative max-h-[90vh] max-w-[90vw]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleClose}
                      className="text-accent hover:text-tertiary border-accent/30 hover:border-tertiary/50 bg-card focus-visible:ring-accent absolute -top-3 -right-3 z-10 border border-dashed p-1.5 transition-colors focus:outline-none focus-visible:ring-2"
                      style={CSS_TRANSITIONS.fade}
                      aria-label="Close image"
                    >
                      <X
                        size={ICON_CONFIG.sizes.sm}
                        strokeWidth={ICON_CONFIG.strokeWidth}
                      />
                    </button>

                    <img
                      src={src}
                      alt={alt}
                      className="border-accent/30 bg-card max-h-[85vh] max-w-full border border-dashed object-contain p-1"
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </>
  );
}
