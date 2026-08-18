import { useState } from "react";
import { awards } from "@/lib/data/awards";
import ClaudeSpinner from "@/components/ui/ClaudeSpinner";
import { DashedBorders, GradientBackground } from "@/components/ui/frame";
import ArrowUpRight from "@/components/ui/ArrowUpRight";
import { ICON_CONFIG } from "@/lib/config/design";
import { CSS_TRANSITIONS } from "@/lib/config/animation";
import type { Award } from "@/lib/types";

// Local logo imports resolve to an ImageMetadata object (astro:assets);
// a plain string is a remote/hosted logo, left unoptimized.
function resolveImageUrl(imageUrl: Award["imageUrl"]) {
  if (!imageUrl) return null;
  if (typeof imageUrl === "string") return { url: imageUrl };
  return { url: imageUrl.src, width: imageUrl.width, height: imageUrl.height };
}

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

const ICON_SIZES = {
  compact: "h-8 sm:h-9",
  normal: "h-10 sm:h-12",
  large: "h-12 sm:h-14",
};

/**
 * Four outlined squares that rearrange from a 2x2 grid into a diagonal
 * cascade on hover — a nod to layout animation, CSS-only.
 */
function StageFigure() {
  const square =
    // Full foreground, not /80: the Claude mark beside it paints at
    // var(--color-foreground), and at 80% these squares came out a step muted
    // against it (#B3AD9D against #DAD2BE in Nightingale).
    "bg-foreground absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 h-3 w-3 transition-transform duration-300 ease-out motion-reduce:transition-none";

  return (
    <div className="relative h-12 w-12" aria-hidden="true">
      <span
        className={`${square} -translate-x-2 -translate-y-2 group-focus-within:-translate-x-[18px] group-focus-within:-translate-y-[18px] group-hover:-translate-x-[18px] group-hover:-translate-y-[18px]`}
      />
      <span
        className={`${square} translate-x-2 -translate-y-2 delay-[40ms] group-focus-within:-translate-x-1.5 group-focus-within:-translate-y-1.5 group-hover:-translate-x-1.5 group-hover:-translate-y-1.5`}
      />
      <span
        className={`${square} -translate-x-2 translate-y-2 delay-[80ms] group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 group-hover:translate-x-1.5 group-hover:translate-y-1.5`}
      />
      <span
        className={`${square} translate-x-2 translate-y-2 delay-[120ms] group-focus-within:translate-x-[18px] group-focus-within:translate-y-[18px] group-hover:translate-x-[18px] group-hover:translate-y-[18px]`}
      />
    </div>
  );
}

export default function AwardsGrid() {
  // Which plate the pointer is on, and a counter that ticks each entry so the
  // Claude mark restarts its frame set rather than resuming mid-orbit.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activation, setActivation] = useState(0);

  return (
    <div className="space-y-4">
      <h2 className="text-foreground font-serif text-2xl">Recognitions</h2>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => {
          // `stats` and `year` are defined on every award but rendered nowhere
          // yet — reserved for the shared project/award modal (plan step 4).
          // The `a` branch is likewise dormant until an award carries a url.
          const Card = award.url ? "a" : "article";
          const logo = resolveImageUrl(award.imageUrl);

          return (
            <Card
              key={award.id}
              {...(award.url
                ? {
                    href: award.url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "aria-label": `View credential for ${award.title}`,
                  }
                : {})}
              onPointerEnter={() => {
                setHoveredId(award.id);
                setActivation((n) => n + 1);
              }}
              onPointerLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(award.id)}
              onBlur={() => setHoveredId(null)}
              className="group bg-card focus-visible:ring-accent focus-visible:ring-offset-background relative flex flex-col overflow-hidden text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              {/* Dashed border only. Corner brackets are reserved for things
                  that open the centre modal, and nothing here does. */}
              <DashedBorders />
              <GradientBackground flash={false} />

              {/* The frame-study shape: mark on the stage, caption beneath —
                  issuer, title, then the one detail worth reading. */}
              <div className="bg-muted relative flex h-32 shrink-0 items-center justify-center sm:h-36">
                <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
                {award.id === "claude-open-source" ? (
                  <ClaudeSpinner
                    playing={hoveredId === award.id}
                    activation={activation}
                    color="var(--color-foreground)"
                  />
                ) : logo ? (
                  <img
                    src={logo.url}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    className={`relative z-10 w-auto ${ICON_SIZES[award.iconSize || "normal"]}`}
                  />
                ) : (
                  <StageFigure />
                )}
              </div>

              {/* The same rule the footer draws, so the stage, the caption and
                  the link row are separated by one boundary treatment rather
                  than by a tone change on one edge and a hairline on the
                  other. */}
              {/* -mt-px: the rule sits ON the stage's bottom edge instead of
                  adding a pixel of height under it, so the card's total stays
                  on the 8px grid. */}
              <div className="border-accent/20 relative -mt-px flex flex-col border-t border-dashed p-4">
                <p className="text-accent mb-2 font-mono text-[0.6875rem] leading-4 tracking-wide">
                  {award.issuer}
                </p>
                <h3 className="text-foreground font-serif text-base leading-6">{award.title}</h3>
                <p className="text-foreground/60 mt-4 text-xs leading-6 [text-wrap:pretty] lg:text-sm">
                  {award.description}
                </p>
              </div>

              {/* Same affordance as a project plate: the mark waits in its own
                  corner, clear of the stage figure and of the caption, and
                  arrives on hover or focus. There the arrow is a sibling link
                  because the card itself opens a modal; here the whole card is
                  the anchor, so this one only has to say "leaves the site" —
                  hence aria-hidden and no tab stop of its own. */}
              {award.url && (
                <div
                  className="absolute top-3 right-3 z-10 leading-none opacity-0 transition-all group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                  style={t}
                  aria-hidden="true"
                >
                  <span
                    className="text-accent group-hover:text-tertiary flex items-center leading-none transition-colors motion-reduce:transition-none"
                    style={tFast}
                  >
                    <ArrowUpRight size={ICON_CONFIG.sizes.md} />
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
