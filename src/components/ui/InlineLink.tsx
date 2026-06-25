import { CSS_TRANSITIONS } from "@/lib/config/animation";

interface InlineLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  hintLabel?: string;
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
  hintLabel,
}: InlineLinkProps) {
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${children} (opens in new tab)`,
      }
    : {};

  return (
    <a
      href={href}
      data-hero-sfx="click"
      data-hero-sfx-hover
      data-link-hint={hintLabel || undefined}
      className={`
        inline
        ${hintLabel ? "link-hint" : ""}
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
        ...CSS_TRANSITIONS.border,
        paddingBottom: "1px",
      }}
      {...externalProps}
    >
      {children}
    </a>
  );
}
