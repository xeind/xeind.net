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
        className={`${square} group-keyboard:-translate-x-[18px] group-keyboard:-translate-y-[18px] -translate-x-2 -translate-y-2 group-hover:-translate-x-[18px] group-hover:-translate-y-[18px]`}
      />
      <span
        className={`${square} group-keyboard:-translate-x-1.5 group-keyboard:-translate-y-1.5 translate-x-2 -translate-y-2 delay-[40ms] group-hover:-translate-x-1.5 group-hover:-translate-y-1.5`}
      />
      <span
        className={`${square} group-keyboard:translate-x-1.5 group-keyboard:translate-y-1.5 -translate-x-2 translate-y-2 delay-[80ms] group-hover:translate-x-1.5 group-hover:translate-y-1.5`}
      />
      <span
        className={`${square} group-keyboard:translate-x-[18px] group-keyboard:translate-y-[18px] translate-x-2 translate-y-2 delay-[120ms] group-hover:translate-x-[18px] group-hover:translate-y-[18px]`}
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

      {/* 480, not sm: at 640 a single card is a full-width slab. The caption
          is the constraint — at 480 each card still gets 216px, enough for
          the description at text-xs. Same arbitrary-breakpoint pattern as
          ProjectGrid's min-[368px]. */}
      <div className="grid w-full grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => {
          // `stats` and `year` are defined on every award but rendered nowhere
          // yet — reserved for the shared project/award modal (plan step 4).
          const logo = resolveImageUrl(award.imageUrl);

          return (
            <article
              key={award.id}
              onPointerEnter={() => {
                setHoveredId(award.id);
                setActivation((n) => n + 1);
              }}
              onPointerLeave={() => setHoveredId(null)}
              className="group bg-card relative flex flex-col overflow-hidden text-left transition-colors motion-reduce:transition-none"
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

              {/* Same affordance as a project plate: the arrow waits in its own
                  corner and arrives on hover or focus. It is the only link —
                  the card itself is inert, so a tap on the stage or the caption
                  never leaves the site. pointer-coarse keeps it visible where
                  hover cannot reveal it: Tailwind gates hover: behind
                  @media (hover: hover), so on touch the reveal never fires. */}
              {award.url && (
                <div
                  className="group-keyboard:opacity-100 absolute top-3 right-3 z-10 leading-none opacity-0 transition-all group-hover:opacity-100 motion-reduce:transition-none pointer-coarse:opacity-100"
                  style={t}
                >
                  <a
                    href={award.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View credential for ${award.title} (opens in new tab)`}
                    // Keyboard focus only, for the same reason the reveal uses
                    // group-keyboard: a click leaves the arrow focused, and
                    // without this test the Claude mark kept spinning after
                    // its tab opened.
                    onFocus={(e) => {
                      if (e.currentTarget.matches(":focus-visible")) setHoveredId(award.id);
                    }}
                    onBlur={() => setHoveredId(null)}
                    className="text-accent hover:text-tertiary focus-visible:ring-accent focus-visible:ring-offset-background flex items-center leading-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                    style={tFast}
                  >
                    <ArrowUpRight size={ICON_CONFIG.sizes.md} />
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
