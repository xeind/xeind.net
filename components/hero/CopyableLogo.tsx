"use client";

import { useState, useRef } from "react";
import StaticLogo from "./StaticLogo";
import LogoTooltipPortal from "@/components/LogoTooltipPortal";
import { useClickSound } from "@/lib/hooks";

interface CopyableLogoProps {
  size?: number;
  className?: string;
}

export default function CopyableLogo({
  size = 64,
  className = "",
}: CopyableLogoProps) {
  const [showPortal, setShowPortal] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { click } = useClickSound();

  const handleClick = () => {
    if (!showPortal) {
      click();

      const svgElement = document.querySelector(".xein-logo svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        navigator.clipboard.writeText(svgString);
        setShowPortal(true);

        setTimeout(() => {
          setShowPortal(false);
        }, 2000);
      }
    } else {
      setShowPortal(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`m-0 cursor-pointer border-0 bg-transparent p-0 align-middle leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        aria-label="Copy logo as SVG"
      >
        <StaticLogo size={size} />
      </button>

      <LogoTooltipPortal
        triggerRef={buttonRef}
        visible={showPortal}
        onClose={() => setShowPortal(false)}
      />
    </>
  );
}
