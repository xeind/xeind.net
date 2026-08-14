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
      // Primary-nav band: prefetch when it scrolls into view, because phones
      // have no hover to trigger the router's default hover prefetch.
      {...(external ? {} : { "data-astro-prefetch": "viewport" })}
      // h-8: the band is 2 grid cells (32px) tall — PRD decision 5. A fixed
      // height instead of padding so the text's line-height can't push it off
      // the cell.
      className="bg-card group focus-visible:ring-accent focus-visible:ring-offset-background relative z-10 block h-8 px-12 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={CSS_TRANSITIONS.border}
      {...externalProps}
    >
      {/* The corner marks light with the edges they terminate. Passed through
          rather than baked into CornerDiamond, which is shared with Panels that
          are not hoverable groups.

          `frame`, not `accent`: the band fills the page frame's content box, so
          all four of these sit ON the vertical rails, half over the paper and
          half over the card. That is the frame case — paper fill, and accent/30
          to match the rails they terminate. Only the bottom pair shows it: the
          band is at document y=0, so the top pair's upper halves fall above the
          origin and render as chevrons. */}
      <CornerDiamond
        position="tl"
        variant="frame"
        className="group-hover:border-accent/60 transition-colors"
        style={CSS_TRANSITIONS.border}
      />
      <CornerDiamond
        position="tr"
        variant="frame"
        className="group-hover:border-accent/60 transition-colors"
        style={CSS_TRANSITIONS.border}
      />
      {/* The bottom pair rides the band's own border, which draws at
          bottom:-1 to sit on the grid line — CornerDiamond's trailing offset
          now centres on that stroke, so no nudge here. */}
      <CornerDiamond
        position="bl"
        variant="frame"
        className="group-hover:border-accent/60 transition-colors"
        style={CSS_TRANSITIONS.border}
      />
      <CornerDiamond
        position="br"
        variant="frame"
        className="group-hover:border-accent/60 transition-colors"
        style={CSS_TRANSITIONS.border}
      />

      {/* Three of this band's four edges are not its own to draw: it sits flush
          inside the page frame, so its sides land on the vertical rails and its
          top lands on the frame's own hairline. Drawing fresh borders there
          would put a second line beside each and read as 2px. These overlay the
          existing lines instead — invisible at rest, brightening the shared
          hairline on hover so the whole boundary lights at once. The band fills
          the frame's content box, so the left rail is its first column and the
          right rail the one just outside it.

          All three carry the resting colour and all three replace the line
          under them rather than adding to it. The left and top are covered by
          the band's own opaque bg-card, so the overlay simply stands in. The
          right is not: main's rail is still painted there, so this overlay is
          built the way Layout builds its rails — w-px with bg-card, a 1px box
          whose whole width is the border — and covers it. Letting the real rail
          show through instead was the earlier arrangement and it lit twice as
          hard as its twin on hover: accent/60 composited over the rail's
          accent/30 reads 0.72 alpha, and the right rail measured 186 -> 103
          against the left's 186 -> 126.

          main's top hairline is main::before at z-10, and this band is z-10
          with an opaque bg-card later in paint order, so the band covered it
          and punched a 1024px hole in the sheet's top rule — ink in the paper
          gutters either side, none across the band. */}
      <div
        className="border-accent/30 group-hover:border-accent/60 absolute top-0 right-0 left-0 border-t transition-colors"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 group-hover:border-accent/60 pointer-events-none absolute top-0 bottom-0 border-l transition-colors"
        style={{ left: 0, ...CSS_TRANSITIONS.border }}
      />
      <div
        className="bg-card border-accent/30 group-hover:border-accent/60 pointer-events-none absolute top-0 bottom-0 w-px border-r transition-colors"
        style={{ right: -1, ...CSS_TRANSITIONS.border }}
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

      <div className="relative z-10 flex h-full items-center justify-center gap-2">
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
          hover, and brightening with the other three. At bottom:-1 so the 1px
          stroke sits ON the 32px grid line ([32,33), the same convention the
          dividers use) instead of one pixel inside the band; the band's z-10
          keeps it visible over the next panel's background. */}
      <div
        className="border-accent/30 group-hover:border-accent/60 absolute right-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={{
          bottom: -1,
          zIndex: 5,
          ...CSS_TRANSITIONS.border,
        }}
      />
    </a>
  );
}
