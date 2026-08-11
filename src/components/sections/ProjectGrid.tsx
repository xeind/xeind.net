import { useEffect, useState, useRef, useCallback, type SVGProps } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { projects } from "@/lib/data/projects";
import { useMounted } from "@/lib/hooks/useMounted";
import Badge from "@/components/ui/Badge";
import { DashedBorders, CornerBrackets, GradientBackground } from "@/components/ui/frame";
import ProjectLogo from "@/components/sections/ProjectLogo";
import ArrowUpRight from "@/components/ui/ArrowUpRight";
import InlineLink from "@/components/ui/InlineLink";
import { ICON_CONFIG } from "@/lib/config/design";
import { SPRING_CONFIG, CSS_TRANSITIONS } from "@/lib/config/animation";
import { useScrollbarCompensation } from "@/lib/hooks/useScrollbarCompensation";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useAudioUnlock, playBrush, playClickLow, playClickSharp } from "@/lib/hooks/useClickSound";

type ResolvedTheme = "light" | "dark" | "nightingale" | "blueprint";

function getResolvedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "dark";

  const themeAttr = document.documentElement.getAttribute("data-theme");

  if (themeAttr === "dark" || themeAttr === "nightingale" || themeAttr === "blueprint") {
    return themeAttr;
  }

  return "light";
}

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

/* Heights tuned by measured ink, not by eye alone: each mark was rasterized
   at plate size and its alpha coverage blended with its tight box
   (scratchpad ink-audit, 2026-08). compact sits at 40px desktop — one step
   under normal — which lands the wide airy marks (yield, smeet) in the same
   optical band as the solid 48px ones. */
const ICON_SIZES = {
  compact: { grid: "h-9 sm:h-10", modal: "h-10 sm:h-11" },
  normal: { grid: "h-10 sm:h-12", modal: "h-12 sm:h-14" },
  large: { grid: "h-12 sm:h-14", modal: "h-14 sm:h-16" },
};

type IconProps = SVGProps<SVGSVGElement> & {
  size: number;
  strokeWidth: number;
};

function CloseIcon({ size, strokeWidth, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Renders `[label](url)` inside a description line as a real link, so a project
 * can point at a dependency mid-sentence instead of pushing it into a row of
 * buttons underneath. Markdown's title syntax — `[label](url "hint")` — becomes
 * the link-hint tooltip. Anything that is not a link passes through untouched.
 */
function withLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/);
    if (!match) return part;

    return (
      <InlineLink key={i} href={match[2]} external hintLabel={match[3]}>
        {match[1]}
      </InlineLink>
    );
  });
}

function getPrimaryProjectUrl(project: (typeof projects)[0]) {
  return project.liveUrl || project.projectLinks?.[0]?.url || project.githubUrl;
}

/** Static borders for the modal (no hover effects) */
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

export default function ProjectGrid() {
  const [activeProject, setActiveProject] = useState<(typeof projects)[0] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getResolvedTheme);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  useAudioUnlock();
  const brush = useCallback(() => {
    if (prefersReducedMotion) return;
    playBrush();
  }, [prefersReducedMotion]);
  const clickLow = useCallback(() => {
    if (prefersReducedMotion) return;
    playClickLow();
  }, [prefersReducedMotion]);
  const clickSharp = useCallback(() => {
    if (prefersReducedMotion) return;
    playClickSharp();
  }, [prefersReducedMotion]);
  const activeProjectUrl = activeProject ? getPrimaryProjectUrl(activeProject) : undefined;

  // Apply scrollbar compensation when modal is open
  useScrollbarCompensation(!!activeProject);

  // Trap focus within modal when open
  useFocusTrap(modalRef, !!activeProject);

  // Handle close with animation guard
  const handleClose = useCallback(() => {
    if (isAnimatingRef.current) return;

    clickSharp();
    isAnimatingRef.current = true;
    setActiveProject(null);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 400);
  }, [clickSharp]);

  // Handle project click with animation guard
  const handleProjectClick = useCallback(
    (project: (typeof projects)[0]) => {
      // Prevent clicks during animation
      if (isAnimatingRef.current) return;

      clickLow();

      // If modal is currently open, close it first, then open new one
      if (activeProject) {
        isAnimatingRef.current = true;
        setActiveProject(null);

        // Wait for exit animation to complete, then open new card
        setTimeout(() => {
          setActiveProject(project);
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 400);
        }, 200); // Exit animation duration (150ms overlay + 50ms buffer)
      } else {
        // No modal open, directly open the new one
        isAnimatingRef.current = true;
        setActiveProject(project);

        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 300);
      }
    },
    [activeProject, clickLow],
  );

  // Handle Escape key
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (activeProject) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [activeProject, handleClose]);

  // Keep project logo variants in sync with theme switcher
  useEffect(() => {
    const syncTheme = () => setResolvedTheme(getResolvedTheme());

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    if (activeProject) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeProject, handleClose]);

  return (
    <>
      {/* Overlay + Modal — portaled to body to escape main's stacking context */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence initial={false}>
              {activeProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                  className="fixed inset-0 z-40 bg-black/30"
                />
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {activeProject && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    layoutId={`card-${activeProject.id}`}
                    className="bg-card pointer-events-auto relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden"
                    style={{ borderRadius: 0 }}
                    ref={modalRef}
                    transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                  >
                    <ModalBorders />
                    <ModalCornerBrackets />

                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className="text-accent hover:text-tertiary border-accent/30 hover:border-tertiary/50 focus-visible:ring-accent absolute top-4 right-4 z-30 border border-dashed p-1.5 transition-colors focus:outline-none focus-visible:ring-2 motion-reduce:transition-none"
                      style={tFast}
                      aria-label="Close modal"
                    >
                      <CloseIcon
                        size={ICON_CONFIG.sizes.sm}
                        strokeWidth={ICON_CONFIG.strokeWidth}
                      />
                    </button>

                    {/* Image area */}
                    <motion.div
                      layoutId={`image-${activeProject.id}`}
                      className="bg-muted border-accent/30 relative flex h-[20vh] shrink-0 items-center justify-center border-b border-dashed"
                      transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                    >
                      <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
                      {activeProject.imageUrl ? (
                        <ProjectLogo
                          projectId={activeProject.id}
                          theme={resolvedTheme}
                          alt={activeProject.title}
                          className={`relative z-10 ${ICON_SIZES[activeProject.iconSize || "normal"].modal}`}
                        />
                      ) : (
                        <div className="text-foreground/60 font-mono text-[0.6875rem]">
                          {activeProject.id}
                        </div>
                      )}
                    </motion.div>

                    {/* Content. No layoutId: a plate has no content block to fly
                        from, and a shared id with only one end is not a morph —
                        it is a silent no-op that reads as jank. The body fades
                        in on its own instead; the plate's two labels still
                        morph, via title- and type-. */}
                    <motion.div
                      className="scrollbar-hide relative flex flex-col overflow-y-auto px-8 py-6"
                      transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                    >
                      {/* Header — the plate's arrangement kept: name on the left,
                          kind opposite it on the right, rather than stacked. The
                          two morph from the plate's corners into the same
                          relationship, so nothing crosses the card on open. */}
                      <div className="mb-4">
                        <div className="flex items-baseline justify-between gap-4">
                          <motion.h3
                            id="modal-title"
                            layoutId={`title-${activeProject.id}`}
                            className="text-foreground font-serif text-xl"
                            transition={
                              prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
                            }
                          >
                            {activeProjectUrl ? (
                              <a
                                href={activeProjectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={brush}
                                onClick={clickLow}
                                className="group hover:text-tertiary inline-flex items-center gap-0.75 transition-all motion-reduce:transition-none"
                                style={t}
                              >
                                <span className="border-accent/30 border-b border-dashed pb-px transition-all group-hover:border-solid">
                                  {activeProject.title}
                                </span>
                                <ArrowUpRight
                                  size={ICON_CONFIG.sizes.md}
                                  trigger="link"
                                  className="mt-0.5 shrink-0"
                                />
                              </a>
                            ) : (
                              activeProject.title
                            )}
                          </motion.h3>
                          <motion.div
                            layoutId={`type-${activeProject.id}`}
                            className="flex shrink-0 items-center gap-1 font-mono text-[0.6875rem] tracking-wide"
                            transition={
                              prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
                            }
                          >
                            <span className="text-accent">{activeProject.type}</span>
                            <span className="text-foreground/60">·</span>
                            <span className="text-tertiary">{activeProject.year}</span>
                          </motion.div>
                        </div>

                        {activeProject.projectLinks && activeProject.projectLinks.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                              opacity: 0,
                              transition: { duration: 0.05 },
                            }}
                            className="mt-3 flex flex-wrap gap-x-4 gap-y-2"
                          >
                            {activeProject.projectLinks.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={brush}
                                onClick={clickLow}
                                className="group text-accent hover:text-tertiary inline-flex items-center gap-1 text-sm transition-all motion-reduce:transition-none"
                                style={t}
                              >
                                <span className="border-accent/30 border-b border-dashed pb-px transition-all group-hover:border-solid">
                                  {link.label}
                                </span>
                                <ArrowUpRight
                                  size={ICON_CONFIG.sizes.sm}
                                  trigger="link"
                                  className="shrink-0"
                                />
                              </a>
                            ))}
                          </motion.div>
                        )}

                        {/* Technologies */}
                        {activeProject.technologies && activeProject.technologies.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                              opacity: 0,
                              transition: { duration: 0.05 },
                            }}
                            className="mt-3 flex flex-wrap gap-2"
                          >
                            {activeProject.technologies.map((tech) => (
                              <Badge key={tech}>{tech}</Badge>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      {/* Dashed separator */}
                      <div className="border-accent/20 mb-4 border-t border-dashed" />

                      {/* Description. No `layout`: the modal is still resizing
                          as it morphs from the plate, and a layout-animated
                          child inside a resizing parent animates its own
                          position too — which reads as the text sliding in from
                          somewhere. It should only fade. */}
                      <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        className="text-foreground/80 mb-4 space-y-1 text-sm leading-relaxed"
                      >
                        {(activeProject.longDescription || [activeProject.description])
                          .filter((point) => point.trim().length > 0)
                          .map((point, i) => (
                            <li key={i} className="flex items-start gap-3">
                              {/* h-7 is one line of leading-relaxed text at this
                                  size, so the dot centres on the first line
                                  instead of being nudged down by a margin that
                                  goes stale the moment the type scale moves. */}
                              <div className="flex h-7 shrink-0 items-center">
                                <div className="bg-foreground/50 h-1 w-1" />
                              </div>
                              <span className="font-serif text-base leading-relaxed [text-wrap:pretty]">
                                {withLinks(point)}
                              </span>
                            </li>
                          ))}
                      </motion.ul>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}

      {/* Project Grid */}
      <div className="space-y-4">
        <h2 className="text-foreground font-serif text-2xl">Projects</h2>

        <div className="grid w-full grid-cols-1 gap-4 min-[368px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => {
            const primaryUrl = getPrimaryProjectUrl(project);
            // Nothing to open: no link, and no copy for a modal to show.
            const openable =
              project.interactive !== false &&
              Boolean(primaryUrl || project.description || project.longDescription?.length);

            return (
              /* The wrapper is the hover group and owns the cell box; the
                 button fills it. The external-link anchor is a SIBLING of the
                 button, layered above it — an <a> inside a <button> is invalid
                 interactive nesting, unreliable for keyboards and readers. As
                 siblings each is its own tab stop and clicks never cross. */
              <div key={project.id} className="group relative h-32 sm:h-36">
                <motion.button
                  layoutId={`card-${project.id}`}
                  {...(openable
                    ? { onMouseEnter: brush, onClick: () => handleProjectClick(project) }
                    : { disabled: true })}
                  className={`bg-muted focus-visible:ring-accent focus-visible:ring-offset-background absolute inset-0 overflow-hidden text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none ${openable ? "cursor-pointer" : "cursor-default"}`}
                  style={{ borderRadius: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                >
                  {openable && <span className="sr-only">View details for</span>}
                  <DashedBorders />
                  {/* Brackets promise a modal. A project with nothing written up
                    and nowhere to go gets the dashed border alone. */}
                  {openable && <CornerBrackets />}
                  {openable && <GradientBackground />}

                  {/* The plate: one figure carrying its own labels. @container so
                    the tag decides for itself whether it fits — the same card
                    is used at three and at six per row. */}
                  <motion.div
                    layoutId={`image-${project.id}`}
                    /* pb-4, not 0 and not the full label height. Centred on the
                     box the mark crowds the name; centred on the free space
                     above the labels it reads high, because the label row is
                     light text and carries less visual weight than its height
                     suggests. Measured on a 144px plate: ink lands 40 from the
                     top and 32 clear of the text. */
                    className="@container absolute inset-0 flex items-center justify-center pb-4"
                    transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                  >
                    <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_top,black_50%,transparent_100%)] opacity-30" />
                    {project.imageUrl ? (
                      <ProjectLogo
                        projectId={project.id}
                        theme={resolvedTheme}
                        alt={project.title}
                        className={`relative z-10 ${ICON_SIZES[project.iconSize || "normal"].grid}`}
                      />
                    ) : (
                      /* No mark yet — the bare id stands in for one. No box
                       around it: a dashed outline reads as a border treatment
                       on this plate, and the plate already has one. */
                      <span className="relative z-10 flex h-12 w-12 items-center justify-center">
                        <span className="text-foreground/30 group-hover:text-foreground/60 font-mono text-[0.625rem] transition-colors motion-reduce:transition-none">
                          {project.id}
                        </span>
                      </span>
                    )}

                    <motion.h3
                      layoutId={`title-${project.id}`}
                      className="text-accent absolute bottom-3 left-3 z-10 font-serif text-base leading-none"
                      transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                    >
                      {project.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`type-${project.id}`}
                      /* invisible, not hidden: this tag is the modal tag's
                         layoutId source. display:none leaves Motion no rect
                         to morph from, so on narrow plates (phones) the
                         modal's tag flew in from a garbage position.
                         visibility keeps the measurable box at the plate
                         corner — same look (it's absolute), real origin. */
                      className="text-foreground/40 absolute right-3 bottom-3 z-10 font-mono text-[0.625rem] tracking-wide @max-[11rem]:invisible"
                      transition={prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce}
                    >
                      {project.type}
                    </motion.p>
                  </motion.div>
                </motion.button>

                {/* External link — sibling of the button, above it. Revealed by
                    hovering anywhere on the cell or focusing either control. */}
                {primaryUrl && (
                  <div
                    className="absolute top-3 right-3 z-10 leading-none opacity-0 transition-all group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                    style={t}
                  >
                    <a
                      href={primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-tertiary flex items-center leading-none transition-colors motion-reduce:transition-none"
                      style={tFast}
                      aria-label={`Open ${project.title} in new tab`}
                    >
                      <ArrowUpRight size={ICON_CONFIG.sizes.md} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
