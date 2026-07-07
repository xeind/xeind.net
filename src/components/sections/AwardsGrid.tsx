import { awards } from "@/lib/data/awards";
import { ICON_CONFIG } from "@/lib/config/design";
import { CSS_TRANSITIONS } from "@/lib/config/animation";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

const ICON_SIZES = {
  compact: "h-8 sm:h-9",
  normal: "h-10 sm:h-12",
  large: "h-12 sm:h-14",
};

function ArrowUpRightIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_CONFIG.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

/** Dashed borders (4 sides) that become solid on group hover */
function DashedBorders() {
  return (
    <>
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 z-10 border-t border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 z-10 border-r border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 z-10 border-b border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 z-10 border-l border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
    </>
  );
}

/** L-shaped corner brackets that change color on group hover */
function CornerBrackets() {
  return (
    <>
      {/* Top-Left */}
      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
      </div>
      {/* Top-Right */}
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
      </div>
      {/* Bottom-Left */}
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
      </div>
      {/* Bottom-Right */}
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-px w-2 transition-all"
          style={t}
        />
      </div>
    </>
  );
}

/** Hover gradient background layer */
function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30"
        style={t}
      />
    </div>
  );
}

/**
 * Four outlined squares that rearrange from a 2x2 grid into a diagonal
 * cascade on hover — a nod to layout animation, CSS-only.
 */
function StageFigure() {
  const square =
    "absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 h-3 w-3 border border-accent/60 bg-card transition-transform duration-300 ease-out motion-reduce:transition-none";

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
  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">
        Awards &amp; Certifications
      </h2>

      <div
        className={`grid w-full grid-cols-1 sm:grid-cols-2 ${GAP_SPACING.sm} lg:grid-cols-3`}
      >
        {awards.map((award, index) => {
          const Card = award.url ? "a" : "article";
          const figNumber = String(index + 1).padStart(2, "0");
          const stats = award.stats?.length
            ? award.stats
            : award.year
              ? [{ key: "year", value: String(award.year) }]
              : [];

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
              className="group bg-card focus-visible:ring-accent focus-visible:ring-offset-background relative flex flex-col overflow-hidden text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              <DashedBorders />
              <CornerBrackets />
              <GradientBackground />

              {/* Canvas / stage */}
              <div className="bg-muted border-accent/30 relative flex h-32 shrink-0 items-center justify-center border-b border-dashed sm:h-36">
                <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
                {award.imageUrl ? (
                  <img
                    src={award.imageUrl}
                    alt=""
                    className={`relative z-10 w-auto ${ICON_SIZES[award.iconSize || "normal"]}`}
                  />
                ) : (
                  <StageFigure />
                )}
                <span className="text-accent absolute bottom-2 left-3 z-10 font-mono text-[0.6875rem] tracking-wide">
                  {award.type}
                </span>
                <span className="text-foreground/40 absolute right-3 bottom-2 z-10 font-mono text-[0.625rem] tracking-wide">
                  FIG.{figNumber}
                </span>
              </div>

              {/* Caption + blurb */}
              <div className="relative flex flex-col p-4 md:p-5">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-accent group-hover:text-tertiary font-mono text-sm transition-colors motion-reduce:transition-none"
                    style={tFast}
                    aria-hidden="true"
                  >
                    &gt;
                  </span>
                  <h3 className="text-foreground font-serif text-sm leading-snug md:text-base">
                    {award.title}
                  </h3>
                </div>
                <p className="text-foreground/60 mt-1 pl-4 font-mono text-[0.6875rem] leading-normal">
                  {award.issuer}
                </p>
                <p className="text-foreground/60 mt-3 text-xs leading-relaxed [text-wrap:pretty] lg:text-sm">
                  {award.description}
                </p>
              </div>

              {/* Footer — key=value stats */}
              <footer className="border-accent/20 relative mt-auto flex items-center justify-between gap-2 border-t border-dashed px-4 py-2.5 md:px-5">
                <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.625rem] tracking-wide">
                  {stats.map((stat) => (
                    <span key={stat.key}>
                      <span className="text-foreground/50">{stat.key}</span>
                      <span className="text-foreground/30">=</span>
                      <span className="text-tertiary">{stat.value}</span>
                    </span>
                  ))}
                </span>
                {award.url && (
                  <span
                    className="text-accent group-hover:text-tertiary shrink-0 leading-none transition-colors motion-reduce:transition-none"
                    style={tFast}
                    aria-hidden="true"
                  >
                    <ArrowUpRightIcon size={ICON_CONFIG.sizes.sm} />
                  </span>
                )}
              </footer>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
