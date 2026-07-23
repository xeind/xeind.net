import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type SVGProps,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { projects } from "@/lib/data/projects";
import Badge from "@/components/ui/Badge";
import ProjectLogo from "@/components/sections/ProjectLogo";
import { ICON_CONFIG } from "@/lib/config/design";
import { SPRING_CONFIG, CSS_TRANSITIONS } from "@/lib/config/animation";
import { useScrollbarCompensation } from "@/lib/hooks/useScrollbarCompensation";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  useAudioUnlock,
  playBrush,
  playClickLow,
  playClickSharp,
} from "@/lib/hooks/useClickSound";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

type ResolvedTheme = "light" | "dark" | "nightingale";

function getResolvedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "dark";

  const themeAttr = document.documentElement.getAttribute("data-theme");

  if (themeAttr === "dark" || themeAttr === "nightingale") {
    return themeAttr;
  }

  return "light";
}

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

const ICON_SIZES = {
  compact: { grid: "h-8 sm:h-9", modal: "h-9 sm:h-10" },
  normal: { grid: "h-10 sm:h-12", modal: "h-12 sm:h-14" },
  large: { grid: "h-12 sm:h-14", modal: "h-14 sm:h-16" },
};

type IconProps = SVGProps<SVGSVGElement> & {
  size: number;
  strokeWidth: number;
};

function ArrowUpRightIcon({
  size,
  strokeWidth,
  className,
  ...props
}: IconProps) {
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
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

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

function getPrimaryProjectUrl(project: (typeof projects)[0]) {
  return project.liveUrl || project.projectLinks?.[0]?.url || project.githubUrl;
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

/** Hover + active gradient background layers */
function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Hover wash */}
      <div
        className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30 group-active:opacity-0"
        style={t}
      />
      {/* Click flash — brighter wash that carries into the layout animation */}
      <div
        className="bg-tertiary/15 absolute inset-0 opacity-0 transition-opacity group-active:opacity-100"
        style={tFast}
      />
    </div>
  );
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
  const [activeProject, setActiveProject] = useState<
    (typeof projects)[0] | null
  >(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getResolvedTheme);
  const [mounted, setMounted] = useState(false);
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
  const activeProjectUrl = activeProject
    ? getPrimaryProjectUrl(activeProject)
    : undefined;

  useEffect(() => setMounted(true), []);

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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    }

    if (activeProject) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeProject, handleClose]);

  return (
    <>
      {/* Overlay + Modal — portaled to body to escape main's stacking context */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {activeProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                  className="fixed inset-0 z-40 bg-black/30"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {activeProject && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    layoutId={`card-${activeProject.id}`}
                    className="bg-card pointer-events-auto relative flex h-[50vh] w-full max-w-xl flex-col overflow-hidden"
                    style={{ borderRadius: 0 }}
                    ref={modalRef}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : SPRING_CONFIG.noBounce
                    }
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
                      className="bg-muted border-accent/30 relative flex h-2/5 shrink-0 items-center justify-center border-b border-dashed"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : SPRING_CONFIG.noBounce
                      }
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

                    {/* Content */}
                    <motion.div
                      layoutId={`content-${activeProject.id}`}
                      className="scrollbar-hide relative flex flex-col overflow-y-auto px-8 py-6"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : SPRING_CONFIG.noBounce
                      }
                    >
                      {/* Header — same order as card: type then title */}
                      <div className="mb-4">
                        <motion.div
                          layoutId={`type-${activeProject.id}`}
                          className="mb-1 flex items-center gap-1 font-mono text-[0.6875rem] tracking-wide"
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : SPRING_CONFIG.noBounce
                          }
                        >
                          <span className="text-accent">
                            {activeProject.type}
                          </span>
                          <span className="text-foreground/60">·</span>
                          <span className="text-tertiary">
                            {activeProject.year}
                          </span>
                        </motion.div>
                        <motion.h3
                          id="modal-title"
                          layoutId={`title-${activeProject.id}`}
                          className="text-foreground font-serif text-xl"
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : SPRING_CONFIG.noBounce
                          }
                        >
                          {activeProjectUrl ? (
                            <a
                              href={activeProjectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onMouseEnter={brush}
                              onClick={clickLow}
                              className="hover:text-tertiary inline-flex items-center gap-0.75 transition-all motion-reduce:transition-none"
                              style={t}
                            >
                              <span className="border-accent/30 border-b border-dashed pb-px transition-all hover:border-solid">
                                {activeProject.title}
                              </span>
                              <ArrowUpRightIcon
                                size={ICON_CONFIG.sizes.md}
                                strokeWidth={ICON_CONFIG.strokeWidth}
                                className="mt-0.5 shrink-0"
                              />
                            </a>
                          ) : (
                            activeProject.title
                          )}
                        </motion.h3>

                        {activeProject.projectLinks &&
                          activeProject.projectLinks.length > 0 && (
                            <motion.div
                              layout
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
                                  className="text-accent hover:text-tertiary inline-flex items-center gap-1 text-sm transition-all motion-reduce:transition-none"
                                  style={t}
                                >
                                  <span className="border-accent/30 border-b border-dashed pb-px transition-all hover:border-solid">
                                    {link.label}
                                  </span>
                                  <ArrowUpRightIcon
                                    size={ICON_CONFIG.sizes.sm}
                                    strokeWidth={ICON_CONFIG.strokeWidth}
                                    className="shrink-0"
                                  />
                                </a>
                              ))}
                            </motion.div>
                          )}

                        {/* Technologies */}
                        {activeProject.technologies &&
                          activeProject.technologies.length > 0 && (
                            <motion.div
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{
                                opacity: 0,
                                transition: { duration: 0.05 },
                              }}
                              className={`mt-3 flex flex-wrap ${GAP_SPACING.xs}`}
                            >
                              {activeProject.technologies.map((tech) => (
                                <Badge key={tech}>{tech}</Badge>
                              ))}
                            </motion.div>
                          )}
                      </div>

                      {/* Dashed separator */}
                      <div className="border-accent/20 mb-4 border-t border-dashed" />

                      {/* Description */}
                      <motion.ul
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        className={`text-foreground/80 mb-4 text-sm leading-relaxed ${STACK_SPACING.tight}`}
                      >
                        {(
                          activeProject.longDescription || [
                            activeProject.description,
                          ]
                        )
                          .filter((point) => point.trim().length > 0)
                          .map((point, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="bg-foreground/50 mt-2 h-1 w-1 shrink-0" />
                              <span className="font-serif text-sm leading-relaxed [text-wrap:pretty]">
                                {point}
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
      <div className={STACK_SPACING.normal}>
        <h2 className="text-foreground font-serif text-2xl">Projects</h2>

        <div
          className={`grid w-full grid-cols-2 ${GAP_SPACING.sm} md:grid-cols-3`}
        >
          {projects.map((project) => {
            const primaryUrl = getPrimaryProjectUrl(project);

            return (
              <motion.button
                layoutId={`card-${project.id}`}
                key={project.id}
                onMouseEnter={brush}
                onClick={() => handleProjectClick(project)}
                className="group bg-card focus-visible:ring-accent focus-visible:ring-offset-background relative aspect-square cursor-pointer overflow-hidden text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                style={{ borderRadius: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <span className="sr-only">View details for</span>
                <DashedBorders />
                <CornerBrackets />
                <GradientBackground />

                {/* External link indicator */}
                {primaryUrl && (
                  <div
                    className="absolute top-4 right-4 z-10 leading-none opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    style={t}
                  >
                    <a
                      href={primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="text-accent hover:text-tertiary flex items-center leading-none transition-colors motion-reduce:transition-none"
                      style={tFast}
                      aria-label={`Open ${project.title} in new tab`}
                    >
                      <ArrowUpRightIcon
                        size={ICON_CONFIG.sizes.md}
                        strokeWidth={ICON_CONFIG.strokeWidth}
                      />
                    </a>
                  </div>
                )}

                {/* Image area with layoutId */}
                <motion.div
                  layoutId={`image-${project.id}`}
                  className="bg-muted border-accent/30 absolute inset-x-0 top-0 flex h-1/2 items-center justify-center border-b border-dashed"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />
                  {project.imageUrl ? (
                    <ProjectLogo
                      projectId={project.id}
                      theme={resolvedTheme}
                      alt={project.title}
                      className={`relative z-10 ${ICON_SIZES[project.iconSize || "normal"].grid}`}
                    />
                  ) : (
                    <div className="text-foreground/60 font-mono text-[0.6875rem]">
                      {project.id}
                    </div>
                  )}
                </motion.div>

                {/* Card content with layoutId */}
                <motion.div
                  layoutId={`content-${project.id}`}
                  className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col p-3 md:p-5"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  <motion.p
                    layoutId={`type-${project.id}`}
                    className="text-accent mb-1 font-mono text-[0.6875rem] tracking-wide"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : SPRING_CONFIG.noBounce
                    }
                  >
                    {project.type}
                  </motion.p>
                  <motion.h3
                    layoutId={`title-${project.id}`}
                    className="text-foreground line-clamp-2 pr-6 font-serif text-sm leading-tight md:text-base"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : SPRING_CONFIG.noBounce
                    }
                  >
                    {project.title}
                  </motion.h3>
                  <p className="text-foreground/60 mt-2 line-clamp-2 hidden text-xs leading-relaxed min-[864px]:mt-auto min-[864px]:block lg:text-sm">
                    {project.description}
                  </p>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}
