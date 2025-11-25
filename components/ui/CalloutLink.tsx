import Link from "next/link";
import CornerDiamond from "@/components/ui/CornerDiamond";
import { DURATION, EASING } from "@/lib/config";

interface CalloutLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export default function CalloutLink({
  href,
  label,
  icon,
  external = false,
}: CalloutLinkProps) {
  const Component = external ? "a" : Link;
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Component
      href={href}
      className="bg-card group relative block px-12 py-2 transition-colors focus:outline-none"
      style={{
        transitionDuration: `${DURATION.normal}s`,
        transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
      }}
      {...externalProps}
    >
      <CornerDiamond position="all" variant="accent" />

      {/* Top border - stays consistent */}
      <div className="border-accent/30 absolute top-0 right-0 left-0 border-t" />

      {/* Center highlight - accent color gradient (0-15-40-60-40-15-0) always visible, full on hover */}
      <div className="pointer-events-none absolute inset-0">
        {/* Default state: masked gradient glow (clickable indicator) */}
        <div
          className="bg-accent/20 absolute inset-0 transition-opacity group-hover:opacity-0"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 37.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 62.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 37.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 62.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
          }}
        />
        {/* Hover state: full fill at 20% opacity */}
        <div
          className="bg-accent/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2">
        <span
          className="font-serif text-sm transition-transform [text-shadow:0px_1px_1.5px_rgba(0,0,0,0.16)] group-hover:translate-x-0.5"
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            className="text-accent-hover flex items-center transition-all will-change-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Bottom edge - dashed by default, solid on hover, stays accent/30 */}
      <div
        className="border-accent/30 absolute right-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={{
          bottom: 0,
          zIndex: 5,
          transitionDuration: `${DURATION.normal}s`,
          transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
        }}
      />
    </Component>
  );
}
