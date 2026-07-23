import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Transition } from "motion/react";
import { projects } from "@/lib/data/projects";
import { awards } from "@/lib/data/awards";
import Badge from "@/components/ui/Badge";
import { ICON_CONFIG } from "@/lib/config/design";
import { SPRING_CONFIG, CSS_TRANSITIONS } from "@/lib/config/animation";
import { useScrollbarCompensation } from "@/lib/hooks/useScrollbarCompensation";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import ataxRaw from "@/assets/atax.svg?raw";
import nightingaleRaw from "@/assets/nightingale.svg?raw";
import smeetRaw from "@/assets/smeet-seo.svg?raw";
import fmeetRaw from "@/assets/fmeet-seo.svg?raw";
import yieldRaw from "@/assets/yield.svg?raw";
import pioneerRaw from "@/assets/pioneer.svg?raw";

const PROJECT_MARKS = [
  { id: "nightingale", svg: nightingaleRaw },
  { id: "atax", svg: ataxRaw },
  { id: "smeet-seo", svg: smeetRaw },
  { id: "fmeet-seo", svg: fmeetRaw },
  { id: "yield", svg: yieldRaw },
  { id: "pioneer", svg: pioneerRaw },
] as const;

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

const sampleProject = projects.find((p) => p.id === "atax") || projects[0];
const sampleAward = awards[0];

type DemoId = "pv1" | "pv2" | "av1" | "av2";

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

function CloseIcon({ size }: { size: number }) {
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
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** Dashed borders (4 sides) that become solid on group hover */
function DashedBorders() {
  return (
    <>
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 z-10 border-t border-dashed transition-all group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 z-10 border-r border-dashed transition-all group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 z-10 border-b border-dashed transition-all group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 z-10 border-l border-dashed transition-all group-hover:border-solid"
        style={t}
      />
    </>
  );
}

/** L-shaped corner brackets that change color on group hover */
function CornerBrackets() {
  return (
    <>
      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
      </div>
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
      </div>
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
      </div>
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
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

/** Static borders for the modal (solid, no hover effects) */
function ModalBorders() {
  return (
    <>
      <div className="border-accent/30 absolute top-0 right-0 left-0 z-10 border-t border-solid" />
      <div className="border-accent/30 absolute top-0 right-0 bottom-0 z-10 border-r border-solid" />
      <div className="border-accent/30 absolute right-0 bottom-0 left-0 z-10 border-b border-solid" />
      <div className="border-accent/30 absolute top-0 bottom-0 left-0 z-10 border-l border-solid" />
    </>
  );
}

/** Static corner brackets for the modal */
function ModalCornerBrackets() {
  return (
    <>
      <div className="absolute top-0 left-0 z-20">
        <div className="bg-tertiary h-px w-2" />
        <div className="bg-tertiary h-2 w-px" />
      </div>
      <div className="absolute top-0 right-0 z-20">
        <div className="bg-tertiary ml-auto h-px w-2" />
        <div className="bg-tertiary ml-auto h-2 w-px" />
      </div>
      <div className="absolute bottom-0 left-0 z-20">
        <div className="bg-tertiary h-2 w-px" />
        <div className="bg-tertiary h-px w-2" />
      </div>
      <div className="absolute right-0 bottom-0 z-20">
        <div className="bg-tertiary ml-auto h-2 w-px" />
        <div className="bg-tertiary ml-auto h-px w-2" />
      </div>
    </>
  );
}

/**
 * Four outlined squares that rearrange from a 2x2 grid into a diagonal
 * cascade on hover — CSS-only.
 */
function StageFigure() {
  const square =
    "absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 h-3 w-3 border border-accent/60 bg-card transition-transform duration-300 ease-out motion-reduce:transition-none";

  return (
    <div className="relative h-12 w-12" aria-hidden="true">
      <span
        className={`${square} -translate-x-2 -translate-y-2 group-hover:-translate-x-[18px] group-hover:-translate-y-[18px]`}
      />
      <span
        className={`${square} translate-x-2 -translate-y-2 delay-[40ms] group-hover:-translate-x-1.5 group-hover:-translate-y-1.5`}
      />
      <span
        className={`${square} -translate-x-2 translate-y-2 delay-[80ms] group-hover:translate-x-1.5 group-hover:translate-y-1.5`}
      />
      <span
        className={`${square} translate-x-2 translate-y-2 delay-[120ms] group-hover:translate-x-[18px] group-hover:translate-y-[18px]`}
      />
    </div>
  );
}

/**
 * A project-grid SVG with one of the mark treatments below. The raw markup
 * is injected as-is — CSS wins over the SVGs' own fill/stroke presentation
 * attributes, so every treatment is a class string, no per-file editing.
 */
function StyledMark({ svg, className }: { svg: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 block h-10 w-16 [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const MARK_VARIANTS = [
  {
    id: "outline",
    note: "card fill · 1px accent stroke",
    cls: "[&_*]:fill-card [&_*]:stroke-accent/60 [&_*]:[fill-opacity:1] [&_*]:[stroke-width:1px] [&_*]:[vector-effect:non-scaling-stroke]",
  },
  {
    id: "line",
    note: "no fill · accent stroke",
    cls: "[&_*]:fill-transparent [&_*]:stroke-accent/80 [&_*]:[stroke-width:1px] [&_*]:[vector-effect:non-scaling-stroke]",
  },
  {
    id: "solid",
    note: "foreground silhouette · source shading kept",
    cls: "[&_*]:fill-foreground/80 [&_*]:[stroke-width:0]",
  },
  {
    id: "duotone",
    note: "muted fill · tertiary stroke",
    cls: "[&_*]:fill-muted [&_*]:stroke-tertiary/60 [&_*]:[fill-opacity:1] [&_*]:[stroke-width:1px] [&_*]:[vector-effect:non-scaling-stroke]",
  },
  {
    id: "original",
    note: "source colors, untouched",
    cls: "",
  },
] as const;

function Chip({ k, v }: { k: string; v: string }) {
  return (
    <span>
      <span className="text-foreground/50">{k}</span>
      <span className="text-foreground/30">=</span>
      <span className="text-tertiary">{v}</span>
    </span>
  );
}

/** Demo cell: any card variant with a mono caption underneath */
function Labeled({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div>
      {children}
      <p className="text-foreground/50 mt-2 font-mono text-[0.6875rem]">
        {caption}
      </p>
    </div>
  );
}

type CardProps = {
  onOpen: (id: DemoId) => void;
  spring: Transition;
};

/** v1 — production project card: split square, image half / content half */
function ProjectCardV1({ onOpen, spring }: CardProps) {
  return (
    <motion.button
      layoutId="demo-card-pv1"
      onClick={() => onOpen("pv1")}
      className="group bg-card relative flex aspect-square w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{ borderRadius: 0 }}
      transition={spring}
      aria-label={`View details for ${sampleProject.title}`}
    >
      <DashedBorders />
      <CornerBrackets />
      <GradientBackground />

      <motion.div
        layoutId="demo-image-pv1"
        className="bg-muted border-accent/30 relative flex h-1/2 w-full shrink-0 items-center justify-center border-b border-dashed"
        transition={spring}
      >
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
        <div className="text-foreground/60 font-mono text-[0.6875rem]">
          {sampleProject.id}
        </div>
      </motion.div>

      <div className="relative flex h-1/2 flex-col overflow-hidden p-3 md:p-4">
        <p className="text-accent mb-1 font-mono text-[0.6875rem] tracking-wide">
          {sampleProject.type}
        </p>
        <motion.h3
          layoutId="demo-title-pv1"
          className="text-foreground line-clamp-2 font-serif text-sm leading-snug"
          transition={spring}
        >
          {sampleProject.title}
        </motion.h3>
        <p className="text-foreground/60 mt-1.5 line-clamp-2 text-xs leading-normal">
          {sampleProject.description}
        </p>
      </div>
    </motion.button>
  );
}

/** v2 — shelved project feature cell: canvas plate, caret caption, prop footer */
function ProjectCardV2({ onOpen, spring }: CardProps) {
  return (
    <motion.button
      layoutId="demo-card-pv2"
      onClick={() => onOpen("pv2")}
      className="group bg-card relative flex w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{ borderRadius: 0 }}
      transition={spring}
      aria-label={`View details for ${sampleProject.title}`}
    >
      <DashedBorders />
      <CornerBrackets />
      <GradientBackground />

      <motion.div
        layoutId="demo-image-pv2"
        className="bg-muted border-accent/30 relative flex h-28 w-full shrink-0 items-center justify-center border-b border-dashed sm:h-32"
        transition={spring}
      >
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
        <div className="text-foreground/60 font-mono text-[0.6875rem]">
          {sampleProject.id}
        </div>
        <p className="text-accent absolute bottom-2 left-3 z-10 font-mono text-[0.6875rem] tracking-wide">
          {sampleProject.type}
        </p>
        <span className="text-foreground/40 absolute right-3 bottom-2 z-10 font-mono text-[0.625rem] tracking-wide">
          FIG.01
        </span>
      </motion.div>

      <div className="relative flex grow flex-col p-3 md:p-4">
        <motion.h3
          layoutId="demo-title-pv2"
          className="text-foreground line-clamp-2 font-serif text-sm leading-snug"
          transition={spring}
        >
          {sampleProject.title}
        </motion.h3>
        <p className="text-foreground/60 mt-1.5 line-clamp-2 text-xs leading-normal">
          {sampleProject.description}
        </p>
      </div>

      <div className="border-accent/20 relative mt-auto flex w-full items-center justify-between gap-2 border-t border-dashed px-3 py-2.5 md:px-4">
        <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.625rem] tracking-wide">
          {sampleProject.year && (
            <Chip k="year" v={String(sampleProject.year)} />
          )}
          {sampleProject.technologies[0] && (
            <Chip k="stack" v={sampleProject.technologies[0].toLowerCase()} />
          )}
        </span>
        <span
          className="text-accent group-hover:text-tertiary shrink-0 leading-none transition-colors motion-reduce:transition-none"
          style={tFast}
          aria-hidden="true"
        >
          <ArrowUpRightIcon size={ICON_CONFIG.sizes.sm} />
        </span>
      </div>
    </motion.button>
  );
}

/** v1 — award card draft: same split square as project cards */
function AwardCardV1({ onOpen, spring }: CardProps) {
  return (
    <motion.button
      layoutId="demo-card-av1"
      onClick={() => onOpen("av1")}
      className="group bg-card relative flex aspect-square w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{ borderRadius: 0 }}
      transition={spring}
      aria-label={`View details for ${sampleAward.title}`}
    >
      <DashedBorders />
      <CornerBrackets />
      <GradientBackground />

      <motion.div
        layoutId="demo-image-av1"
        className="bg-muted border-accent/30 relative flex h-1/2 w-full shrink-0 items-center justify-center border-b border-dashed"
        transition={spring}
      >
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
        <div className="text-foreground/60 font-mono text-[0.6875rem]">
          {sampleAward.id}
        </div>
      </motion.div>

      <div className="relative flex h-1/2 flex-col overflow-hidden p-3 md:p-4">
        <p className="text-accent mb-1 font-mono text-[0.6875rem] tracking-wide">
          {sampleAward.type}
          <span className="text-foreground/60"> · </span>
          <span className="text-tertiary">{sampleAward.year}</span>
        </p>
        <motion.h3
          layoutId="demo-title-av1"
          className="text-foreground line-clamp-2 font-serif text-sm leading-snug"
          transition={spring}
        >
          {sampleAward.title}
        </motion.h3>
        <p className="text-foreground/60 mt-0.5 line-clamp-1 text-xs leading-normal">
          {sampleAward.issuer}
        </p>
      </div>
    </motion.button>
  );
}

/** v2 — current award feature cell: stage figure, caret caption, stats footer */
function AwardCardV2({ onOpen, spring }: CardProps) {
  return (
    <motion.button
      layoutId="demo-card-av2"
      onClick={() => onOpen("av2")}
      className="group bg-card relative flex w-full cursor-pointer flex-col overflow-hidden text-left"
      style={{ borderRadius: 0 }}
      transition={spring}
      aria-label={`View details for ${sampleAward.title}`}
    >
      <DashedBorders />
      <CornerBrackets />
      <GradientBackground />

      <motion.div
        layoutId="demo-image-av2"
        className="bg-muted border-accent/30 relative flex h-28 w-full shrink-0 items-center justify-center border-b border-dashed sm:h-32"
        transition={spring}
      >
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
        <StageFigure />
        <span className="text-accent absolute bottom-2 left-3 z-10 font-mono text-[0.6875rem] tracking-wide">
          {sampleAward.type}
        </span>
        <span className="text-foreground/40 absolute right-3 bottom-2 z-10 font-mono text-[0.625rem] tracking-wide">
          FIG.01
        </span>
      </motion.div>

      <div className="relative flex w-full flex-col p-3 md:p-4">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-accent group-hover:text-tertiary font-mono text-sm transition-colors motion-reduce:transition-none"
            style={tFast}
            aria-hidden="true"
          >
            &gt;
          </span>
          <motion.h3
            layoutId="demo-title-av2"
            className="text-foreground font-serif text-sm leading-snug"
            transition={spring}
          >
            {sampleAward.title}
          </motion.h3>
        </div>
        <p className="text-foreground/60 mt-1 pl-4 font-mono text-[0.6875rem] leading-normal">
          {sampleAward.issuer}
        </p>
        <p className="text-foreground/60 mt-2 text-xs leading-normal [text-wrap:pretty]">
          {sampleAward.description}
        </p>
      </div>

      <footer className="border-accent/20 relative mt-auto flex w-full items-center justify-between gap-2 border-t border-dashed px-3 py-2.5 md:px-4">
        <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.625rem] tracking-wide">
          {(sampleAward.stats || []).map((stat) => (
            <Chip key={stat.key} k={stat.key} v={stat.value} />
          ))}
        </span>
      </footer>
    </motion.button>
  );
}

/** Canvas plate only: grid-pattern stage with optional type + FIG labels */
function Plate({
  type,
  fig,
  children,
}: {
  type?: string;
  fig?: string;
  children: ReactNode;
}) {
  return (
    <div className="group bg-muted relative flex h-28 items-center justify-center overflow-hidden sm:h-32">
      <DashedBorders />
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-30 [mask-image:linear-gradient(to_top,black_50%,transparent_100%)]" />
      {children}
      {type && (
        <span className="text-accent absolute bottom-2 left-3 z-10 font-mono text-[0.6875rem] tracking-wide">
          {type}
        </span>
      )}
      {fig && (
        <span className="text-foreground/40 absolute right-3 bottom-2 z-10 font-mono text-[0.625rem] tracking-wide">
          {fig}
        </span>
      )}
    </div>
  );
}

export default function GridIterations() {
  const [active, setActive] = useState<DemoId | null>(null);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const spring: Transition = prefersReducedMotion
    ? { duration: 0 }
    : SPRING_CONFIG.noBounce;

  const isAward = active === "av1" || active === "av2";

  useEffect(() => setMounted(true), []);
  useScrollbarCompensation(!!active);
  useFocusTrap(modalRef, !!active);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }

    if (active) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [active]);

  return (
    <>
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  onClick={() => setActive(null)}
                  className="fixed inset-0 z-40 bg-black/30"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {active && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    layoutId={`demo-card-${active}`}
                    className="bg-card pointer-events-auto relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden"
                    style={{ borderRadius: 0 }}
                    ref={modalRef}
                    transition={spring}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="demo-modal-title"
                  >
                    <ModalBorders />
                    <ModalCornerBrackets />

                    <button
                      onClick={() => setActive(null)}
                      className="text-accent hover:text-tertiary border-accent/30 hover:border-tertiary/50 focus-visible:ring-accent absolute top-4 right-4 z-30 border border-dashed p-1.5 transition-colors focus:outline-none focus-visible:ring-2 motion-reduce:transition-none"
                      style={tFast}
                      aria-label="Close modal"
                    >
                      <CloseIcon size={ICON_CONFIG.sizes.sm} />
                    </button>

                    {/* Image area */}
                    <motion.div
                      layoutId={`demo-image-${active}`}
                      className="bg-muted border-accent/30 relative flex h-36 shrink-0 items-center justify-center border-b border-dashed sm:h-40"
                      transition={spring}
                    >
                      <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
                      {active === "av2" ? (
                        <StageFigure />
                      ) : (
                        <div className="text-foreground/60 font-mono text-[0.6875rem]">
                          {isAward ? sampleAward.id : sampleProject.id}
                        </div>
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="scrollbar-hide relative flex flex-col overflow-y-auto px-8 py-6">
                      <div className="mb-1 flex items-center gap-1 font-mono text-[0.6875rem] tracking-wide">
                        <span className="text-accent">
                          {isAward ? sampleAward.type : sampleProject.type}
                        </span>
                        <span className="text-foreground/60">·</span>
                        <span className="text-tertiary">
                          {isAward ? sampleAward.year : sampleProject.year}
                        </span>
                      </div>
                      <motion.h3
                        id="demo-modal-title"
                        layoutId={`demo-title-${active}`}
                        className="text-foreground font-serif text-xl"
                        transition={spring}
                      >
                        {isAward ? sampleAward.title : sampleProject.title}
                      </motion.h3>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                      >
                        {isAward ? (
                          <>
                            <p className="text-foreground/60 mt-1 font-mono text-[0.6875rem]">
                              {sampleAward.issuer}
                            </p>
                            <div className="border-accent/20 my-4 border-t border-dashed" />
                            <p className="text-foreground/80 font-serif text-sm leading-relaxed [text-wrap:pretty]">
                              {sampleAward.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.625rem] tracking-wide">
                              {(sampleAward.stats || []).map((stat) => (
                                <Chip
                                  key={stat.key}
                                  k={stat.key}
                                  v={stat.value}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {sampleProject.technologies.map((tech) => (
                                <Badge key={tech}>{tech}</Badge>
                              ))}
                            </div>
                            <div className="border-accent/20 my-4 border-t border-dashed" />
                            <ul className="text-foreground/80 space-y-1 text-sm leading-relaxed">
                              {(
                                sampleProject.longDescription || [
                                  sampleProject.description,
                                ]
                              )
                                .filter((point) => point.trim().length > 0)
                                .map((point, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="bg-foreground/50 mt-2 h-1 w-1 shrink-0" />
                                    <span className="font-serif text-sm leading-relaxed [text-wrap:pretty]">
                                      {point}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}

      <div className="space-y-6">
        <div>
          <p className="text-foreground/50 mb-3 font-mono text-xs">
            With text body — click a card to open its center modal
          </p>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Labeled caption="project · v1 · production">
              <ProjectCardV1 onOpen={setActive} spring={spring} />
            </Labeled>
            <Labeled caption="project · v2 · shelved">
              <ProjectCardV2 onOpen={setActive} spring={spring} />
            </Labeled>
            <Labeled caption="award · v1 · draft">
              <AwardCardV1 onOpen={setActive} spring={spring} />
            </Labeled>
            <Labeled caption="award · v2 · current">
              <AwardCardV2 onOpen={setActive} spring={spring} />
            </Labeled>
          </div>
        </div>

        <div className="border-accent/20 border-t border-dashed" />

        <div>
          <p className="text-foreground/50 mb-3 font-mono text-xs">
            Plate only
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Labeled caption="plain">
              <Plate>
                <div className="text-foreground/60 relative z-10 font-mono text-[0.6875rem]">
                  atax
                </div>
              </Plate>
            </Labeled>
            <Labeled caption="labels">
              <Plate type="Tool" fig="FIG.01">
                <div className="text-foreground/60 relative z-10 font-mono text-[0.6875rem]">
                  atax
                </div>
              </Plate>
            </Labeled>
            <Labeled caption="figure">
              <Plate>
                <StageFigure />
              </Plate>
            </Labeled>
            <Labeled caption="figure + labels">
              <Plate type="Cohort" fig="FIG.01">
                <StageFigure />
              </Plate>
            </Labeled>
          </div>
        </div>

        {MARK_VARIANTS.map(({ id: variantId, note, cls }, variantIndex) => (
          <div key={variantId} className="space-y-6">
            <div className="border-accent/20 border-t border-dashed" />
            <div>
              <p className="text-foreground/50 mb-3 font-mono text-xs">
                Project marks · {variantId}
                <span className="text-foreground/30"> — {note}</span>
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {PROJECT_MARKS.map(({ id, svg }) =>
                  variantIndex === 0 ? (
                    <Labeled key={id} caption={id}>
                      <Plate>
                        <StyledMark svg={svg} className={cls} />
                      </Plate>
                    </Labeled>
                  ) : (
                    <Plate key={id}>
                      <StyledMark svg={svg} className={cls} />
                    </Plate>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
