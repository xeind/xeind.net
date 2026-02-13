"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import { Badge } from "@/components/ui";
import { ICON_CONFIG } from "@/lib/config/design";
import { SPRING_CONFIG, DURATION, EASING } from "@/lib/config/animation";
import {
  useScrollbarCompensation,
  useFocusTrap,
  useReducedMotion,
} from "@/lib/hooks";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

const t = {
  transitionDuration: `${DURATION.normal}s`,
  transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
};

const tFast = {
  transitionDuration: `${DURATION.fast}s`,
  transitionTimingFunction: `cubic-bezier(${EASING.easeOutCubic.join(",")})`,
};

const invertedGradientMask = {
  maskImage:
    "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
};

/** Dashed borders (4 sides) that become solid on group hover */
function DashedBorders() {
  return (
    <>
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 border-t border-dashed transition-all group-hover:border-solid group-focus-within:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 border-r border-dashed transition-all group-hover:border-solid group-focus-within:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 border-b border-dashed transition-all group-hover:border-solid group-focus-within:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 border-l border-dashed transition-all group-hover:border-solid group-focus-within:border-solid"
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
  const prefersReducedMotion = useReducedMotion();

  // Apply scrollbar compensation when modal is open
  useScrollbarCompensation(!!activeProject);

  // Trap focus within modal when open
  useFocusTrap(modalRef, !!activeProject);

  // Handle close with animation guard
  const handleClose = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setActiveProject(null);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 400);
  }, []);

  // Handle project click with animation guard
  const handleProjectClick = useCallback(
    (project: (typeof projects)[0]) => {
      // Prevent clicks during animation
      if (isAnimatingRef.current) return;

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
    [activeProject],
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
      {/* Overlay */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
            }
            className="fixed inset-0 z-40 bg-black/20"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {activeProject && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              layoutId={`card-${activeProject.id}`}
              className="bg-card pointer-events-auto relative flex h-[50vh] w-full max-w-xl flex-col overflow-hidden"
              style={{ borderRadius: 0 }}
              ref={modalRef}
              transition={
                prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
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
                className="text-accent hover:text-tertiary border-accent/30 hover:border-tertiary/50 absolute top-4 right-4 z-30 border border-dashed p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                style={tFast}
                aria-label="Close modal"
              >
                <X
                  size={ICON_CONFIG.sizes.sm}
                  strokeWidth={ICON_CONFIG.strokeWidth}
                />
              </button>

              {/* Image area */}
              <motion.div
                layoutId={`image-${activeProject.id}`}
                className="bg-muted relative flex h-2/5 shrink-0 items-center justify-center border-b border-dashed border-accent/30"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <div className="bg-grid-pattern absolute inset-0 opacity-10" />
                <div className="text-foreground/60 font-mono text-[0.6875rem]">
                  IMG_{activeProject.id}
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                layoutId={`content-${activeProject.id}`}
                className="scrollbar-hide flex flex-col overflow-y-auto px-8 py-6"
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
                    <span className="text-accent">{activeProject.type}</span>
                    <span className="text-foreground/60">·</span>
                    <span className="text-tertiary">{activeProject.year}</span>
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
                    {(activeProject.liveUrl || activeProject.githubUrl) ? (
                      <a
                        href={activeProject.liveUrl || activeProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-tertiary inline-flex items-center gap-1 transition-colors motion-reduce:transition-none"
                        style={tFast}
                      >
                        {activeProject.title}
                        <ArrowUpRight
                          size={ICON_CONFIG.sizes.sm}
                          strokeWidth={ICON_CONFIG.strokeWidth}
                        />
                      </a>
                    ) : (
                      activeProject.title
                    )}
                  </motion.h3>

                  {/* Technologies */}
                  {activeProject.technologies && activeProject.technologies.length > 0 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.05 } }}
                      className={`mt-2 flex flex-wrap ${GAP_SPACING.xs}`}
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
                <motion.p
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  className="text-foreground/80 mb-4 text-sm leading-relaxed"
                >
                  {activeProject.longDescription || activeProject.description}
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Grid */}
      <div className={STACK_SPACING.normal}>
        <h2 className="text-foreground font-serif text-2xl">Projects</h2>

        <div
          className={`grid w-full grid-cols-2 ${GAP_SPACING.sm} md:grid-cols-3`}
        >
          {projects.map((project) => (
            <motion.button
              layoutId={`card-${project.id}`}
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="group bg-card relative aspect-square cursor-pointer overflow-hidden text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              style={{ borderRadius: 0 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
              }
              aria-label={`View details for ${project.title}`}
            >
              <DashedBorders />
              <CornerBrackets />
              <GradientBackground />

              {/* External link indicator */}
              {(project.liveUrl || project.githubUrl) && (
                <div
                  className="absolute top-4 right-4 z-10 opacity-0 transition-all group-hover:opacity-100 motion-reduce:transition-none"
                  style={t}
                >
                  <a
                    href={project.liveUrl || project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="text-accent hover:text-tertiary inline-flex transition-colors motion-reduce:transition-none"
                    style={tFast}
                    aria-label={`Open ${project.title} in new tab`}
                  >
                    <ArrowUpRight
                      size={ICON_CONFIG.sizes.md}
                      strokeWidth={ICON_CONFIG.strokeWidth}
                    />
                  </a>
                </div>
              )}

              {/* Image area with layoutId */}
              <motion.div
                layoutId={`image-${project.id}`}
                className="absolute inset-x-0 top-0 h-1/2 border-b border-dashed border-accent/20"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <div className="bg-grid-pattern absolute inset-0 opacity-5" />
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
                  className="text-accent mb-1 hidden font-mono text-[0.6875rem] tracking-wide md:block"
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
                  className="text-foreground font-serif text-base"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  {project.title}
                </motion.h3>
                <p className="text-foreground/60 mt-auto hidden text-xs leading-relaxed line-clamp-2 md:block lg:text-sm">
                  {project.description}
                </p>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}
