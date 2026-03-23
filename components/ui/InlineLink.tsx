"use client";

import Link from "next/link";
import { DURATION, EASING } from "@/lib/config";
import { useClickSound } from "@/lib/hooks";

interface InlineLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  onHoverSound?: () => void;
}

/**
 * InlineLink - Text links with dashed underline
 *
 * Design Pattern:
 * - Dashed border-bottom (indicates clickability, matches button/callout borders)
 * - Text color changes on hover (accent → tertiary)
 * - Border becomes solid on hover but STAYS accent/30 (matches Button/CalloutLink)
 * - Uses border-bottom instead of text-decoration for consistent dash rendering
 * - Smooth 200ms ease-out transition
 *
 * Usage:
 *   <InlineLink href="/about">internal link</InlineLink>
 *   <InlineLink href="https://github.com" external>external link</InlineLink>
 */
export default function InlineLink({
  href,
  children,
  external = false,
  className = "",
  onHoverSound,
}: InlineLinkProps) {
  const { hover, clickHigh } = useClickSound();
  const soundHandler = onHoverSound ?? hover;
  const Component = external ? "a" : Link;
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${children} (opens in new tab)`,
      }
    : {};

  return (
    <Component
      href={href}
      onMouseEnter={soundHandler}
      onClick={clickHigh}
      className={`
        inline
        text-accent
        hover:text-tertiary
        border-b
        border-accent/30
        border-dashed
        hover:border-solid
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-accent
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background
        transition-all
        ${className}
      `}
      style={{
        transitionDuration: `${DURATION.normal}s`,
        transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        paddingBottom: "1px",
      }}
      {...externalProps}
    >
      {children}
    </Component>
  );
}
