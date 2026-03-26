"use client";

import { useState, useCallback } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import XeinLogo from "../XeinLogoClient";
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
  const { click } = useClickSound();

  const getCleanSvgString = useCallback((svgElement: SVGSVGElement) => {
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    const sourceElements = [
      svgElement,
      ...Array.from(svgElement.querySelectorAll("*")),
    ];
    const clonedElements = [
      clonedSvg,
      ...Array.from(clonedSvg.querySelectorAll("*")),
    ];

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.removeAttribute("width");
    clonedSvg.removeAttribute("height");
    clonedSvg.removeAttribute("style");
    clonedSvg.removeAttribute("class");

    for (let i = 0; i < clonedElements.length; i += 1) {
      const sourceNode = sourceElements[i] as Element;
      const clonedNode = clonedElements[i] as Element;
      const computed = window.getComputedStyle(sourceNode);

      clonedNode.removeAttribute("class");
      clonedNode.removeAttribute("style");

      Array.from(clonedNode.attributes)
        .filter((attr) => attr.name.startsWith("data-"))
        .forEach((attr) => clonedNode.removeAttribute(attr.name));

      if (computed.fill && computed.fill !== "none") {
        clonedNode.setAttribute("fill", computed.fill);
      }

      if (computed.stroke && computed.stroke !== "none") {
        clonedNode.setAttribute("stroke", computed.stroke);
      }

      if (computed.strokeWidth && computed.strokeWidth !== "0px") {
        clonedNode.setAttribute(
          "stroke-width",
          computed.strokeWidth.replace("px", "")
        );
      }

      if (computed.strokeLinecap && computed.strokeLinecap !== "butt") {
        clonedNode.setAttribute("stroke-linecap", computed.strokeLinecap);
      }

      if (computed.strokeDasharray && computed.strokeDasharray !== "none") {
        clonedNode.setAttribute("stroke-dasharray", computed.strokeDasharray);
      }

      if (computed.opacity && computed.opacity !== "1") {
        clonedNode.setAttribute("opacity", computed.opacity);
      }
    }

    return new XMLSerializer().serializeToString(clonedSvg);
  }, []);

  const handleCopy = useCallback(() => {
    click();

    const svgElement = document.querySelector(
      ".xein-logo svg"
    ) as SVGSVGElement | null;
    if (svgElement) {
      const svgString = getCleanSvgString(svgElement);
      navigator.clipboard.writeText(svgString);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    }
  }, [click, getCleanSvgString]);

  // Handle right-click
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      click();
      setOpen(true);
    },
    [click]
  );

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          onContextMenu={handleContextMenu}
          onPointerDown={(e) => {
            if (e.button === 0) {
              e.preventDefault();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
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
              onCloseAutoFocus={(e) => e.preventDefault()}
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
