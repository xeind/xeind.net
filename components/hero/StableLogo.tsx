"use client";

import { useState, useRef, useCallback } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import XeinLogo from "../XeinLogo";
import { useClickSound } from "@/lib/hooks";
import { SPRING_CONFIG } from "@/lib/config/animation";

interface StableLogoProps {
  size?: number;
  className?: string;
}

/**
 * StableLogo - Logo with right-click context menu
 *
 * Right-click on the logo to show a context menu with "Copy Logo SVG" option.
 * Uses Radix DropdownMenu for accessibility and clean animations.
 */
export default function StableLogo({
  size = 64,
  className = "",
}: StableLogoProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { click, nudge } = useClickSound();

  const handleCopy = useCallback(() => {
    click();
    nudge();

    const svgElement = document.querySelector(".xein-logo svg");
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      navigator.clipboard.writeText(svgString);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    }
  }, [click, nudge]);

  // Handle right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
  }, []);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          onContextMenu={handleContextMenu}
          onClick={() => {
            nudge();
          }}
          className={`m-0 inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 align-middle leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
          aria-label="Copy logo as SVG (right-click)"
          style={{ width: size, height: size }}
        >
          <XeinLogo size={size} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <AnimatePresence mode="wait">
          {open && (
            <DropdownMenu.Content
              className="bg-card border-accent/30 z-50 w-fit min-w-fit overflow-hidden border border-dashed p-1 shadow-lg"
              sideOffset={5}
              align="start"
              side="bottom"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={SPRING_CONFIG.noBounce}
                style={{
                  transformOrigin:
                    "var(--radix-dropdown-menu-content-transform-origin)",
                  willChange: "transform, opacity",
                }}
              >
                <DropdownMenu.Item
                  className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer px-3 py-2 font-mono text-xs outline-none select-none"
                  onSelect={(event) => {
                    event.preventDefault();
                    handleCopy();
                  }}
                >
                  {copied ? (
                    <span className="text-success flex items-center gap-2">
                      <Check size={12} strokeWidth={1} />
                      Copied!
                    </span>
                  ) : (
                    <span>Copy Logo SVG</span>
                  )}
                </DropdownMenu.Item>
              </motion.div>
            </DropdownMenu.Content>
          )}
        </AnimatePresence>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
