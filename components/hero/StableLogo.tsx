"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import XeinLogo from "../XeinLogo";
import { useClickSound } from "@/lib/hooks";

interface StableLogoProps {
  size?: number;
  className?: string;
}

/**
 * StableLogo - Logo with copy functionality (always mounted, no swap)
 *
 * Unlike SmartLogo which swaps components on hover (causing twitch),
 * this component is always mounted. The heavy tooltip functionality
 * is lazy-loaded only when needed, but the button and logo stay stable.
 *
 * This eliminates the hover twitch completely.
 */
export default function StableLogo({
  size = 64,
  className = "",
}: StableLogoProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipLoaded, setTooltipLoaded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { click } = useClickSound();

  // Lazy load tooltip component only when first needed
  const handleClick = useCallback(() => {
    click();

    if (!tooltipLoaded) {
      // First click: just load the tooltip, don't show yet
      setTooltipLoaded(true);
      setShowTooltip(true);
    } else if (!copied) {
      // Copy the SVG
      const svgElement = document.querySelector(".xein-logo svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        navigator.clipboard.writeText(svgString);
        setCopied(true);
        setShowTooltip(true);

        setTimeout(() => {
          setShowTooltip(false);
          setCopied(false);
        }, 2000);
      }
    }
  }, [click, tooltipLoaded, copied]);

  // Hide tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
        setCopied(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTooltip]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleClick}
        className={`m-0 inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 align-middle leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        aria-label="Copy logo as SVG"
        style={{ width: size, height: size }}
      >
        <XeinLogo size={size} />
      </button>

      {/* Tooltip - only renders when loaded and visible */}
      {tooltipLoaded && showTooltip && (
        <LogoTooltip
          triggerRef={triggerRef}
          copied={copied}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </>
  );
}

// Lightweight tooltip component (separate to avoid loading motion until needed)
function LogoTooltip({
  triggerRef,
  copied,
  onClose,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  copied: boolean;
  onClose: () => void;
}) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const label = copied ? "Copied!" : "Copy logo as SVG";

  useEffect(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, [triggerRef]);

  // Don't render until coords are calculated (prevents flash at 0,0)
  if (!coords) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded border border-dashed border-accent/30 bg-card px-2 py-1 font-mono text-xs"
      style={{
        left: coords.x,
        top: coords.y,
        transform: "translateX(-50%)",
      }}
    >
      {label}
    </div>
  );
}
