import CornerDiamond from "@/components/ui/CornerDiamond";
import { CSS_TRANSITIONS } from "@/lib/config/animation";

interface CalloutLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export default function CalloutLink({ href, label, icon, external = false }: CalloutLinkProps) {
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <a
      href={href}
      data-hero-sfx="click"
      className="bg-card group focus-visible:ring-accent focus-visible:ring-offset-background relative block px-12 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={CSS_TRANSITIONS.border}
      {...externalProps}
    >
      {/* The corner marks light with the edges they terminate. Passed through
          rather than baked into CornerDiamond, which is shared with Panels that
          are not hoverable groups. */}
      <CornerDiamond
        position="all"
        variant="accent"
        className="group-hover:border-accent/60 transition-colors"
      />

      {/* Three of this band's four edges are not its own to draw: it sits flush
          inside the page frame, so its sides land on the vertical rails and its
          top lands on the frame's own hairline. Drawing fresh borders there
          would put a second line beside each and read as 2px. These overlay the
          existing lines instead — invisible at rest, brightening the shared
          hairline on hover so the whole boundary lights at once. The sides need
          -1px because the band starts at the frame's padding box, one border
          width inside the rail. */}
      <div className="border-accent/30 group-hover:border-accent/60 absolute top-0 right-0 left-0 border-t transition-colors" />
      <div
        className="group-hover:border-accent/60 pointer-events-none absolute top-0 bottom-0 border-l border-transparent transition-colors"
        style={{ left: -1 }}
      />
      <div
        className="group-hover:border-accent/60 pointer-events-none absolute top-0 bottom-0 border-r border-transparent transition-colors"
        style={{ right: -1 }}
      />

      {/* Center highlight - accent color gradient (0-15-40-60-40-15-0) always visible, full on hover */}
      <div className="pointer-events-none absolute inset-0">
        {/* Default state: masked gradient glow (clickable indicator) */}
        <div
          className="bg-accent/20 absolute inset-0 transition-opacity group-hover:opacity-0 group-active:opacity-0"
          style={{
            ...CSS_TRANSITIONS.border,
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 37.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 62.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 37.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 62.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
          }}
        />
        {/* Hover state: a flat fill across the whole band. Tinted with tertiary
            and scaled by --surface-hover-fill, the same pair the hero CTAs use,
            so the two land on the same colour. */}
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-(--surface-hover-fill)"
          style={CSS_TRANSITIONS.border}
        />
        {/* Active/Click state: intense gradient pulse */}
        <div
          className="bg-accent/30 absolute inset-0 opacity-0 transition-opacity group-active:opacity-20"
          style={{
            ...CSS_TRANSITIONS.fade,
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2">
        <span className="font-serif text-sm">{label}</span>
        {icon && (
          <span
            className="text-accent group-hover:text-tertiary flex items-center transition-all will-change-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            style={CSS_TRANSITIONS.border}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Bottom edge — the only one the band owns. Dashed by default, solid on
          hover, and brightening with the other three. */}
      <div
        className="border-accent/30 group-hover:border-accent/60 absolute right-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={{
          bottom: 0,
          zIndex: 5,
          ...CSS_TRANSITIONS.border,
        }}
      />
    </a>
  );
}
