"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import { Badge } from "@/components/ui";
import { ICON_CONFIG } from "@/lib/config/design";
import { SPRING_CONFIG } from "@/lib/config/animation";
import {
  useScrollbarCompensation,
  useFocusTrap,
  useReducedMotion,
} from "@/lib/hooks";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

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
      {/* Overlay - S-Tier: opacity only, compositor-accelerated */}
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

      {/* Modal - S-Tier: layoutId uses compositor transforms */}
      <AnimatePresence>
        {activeProject && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              layoutId={`card-${activeProject.id}`}
              className="ring-accent bg-card pointer-events-auto relative flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden ring-1"
              style={{ borderRadius: "var(--radius)" }}
              ref={modalRef}
              transition={
                prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="bg-card/80 hover:bg-muted focus:ring-accent absolute top-4 right-4 z-10 rounded-full p-2 transition-all duration-150 ease-out will-change-transform hover:scale-110 focus:ring-2 focus:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
                aria-label="Close modal"
              >
                <X
                  size={ICON_CONFIG.sizes.md}
                  strokeWidth={ICON_CONFIG.strokeWidth}
                />
              </button>

              {/* Image area - layoutId for smooth transition */}
              <motion.div
                layoutId={`image-${activeProject.id}`}
                className="ring-accent bg-muted relative flex h-2/5 items-center justify-center ring-1"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <div className="bg-grid-pattern absolute inset-0 opacity-10" />
                <div className="text-foreground/40 font-mono text-sm">
                  IMG_{activeProject.id}
                </div>
              </motion.div>

              {/* Content - layoutId for text animations */}
              <motion.div
                layoutId={`content-${activeProject.id}`}
                className="scrollbar-hide overflow-y-auto p-8"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <motion.h3
                  id="modal-title"
                  layoutId={`title-${activeProject.id}`}
                  className="mb-4 font-serif text-lg"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  {activeProject.title}
                </motion.h3>
                <motion.p
                  layoutId={`type-${activeProject.id}`}
                  className="text-foreground/60 mb-4 font-mono text-sm uppercase"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  {activeProject.type}
                </motion.p>

                {/* Long description - fade in after layout animation */}
                <motion.p
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  className="text-foreground/70 mb-4 leading-relaxed"
                >
                  {activeProject.longDescription || activeProject.description}
                </motion.p>

                {/* Technologies */}
                {activeProject.technologies && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.05 } }}
                    className={`flex flex-wrap ${GAP_SPACING.xs}`}
                  >
                    {activeProject.technologies.map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Grid */}
      <div className={STACK_SPACING.normal}>
        <h2 className="text-foreground font-serif text-2xl">Projects</h2>

        <div
          className={`grid w-full grid-cols-1 ${GAP_SPACING.sm} md:grid-cols-3`}
        >
          {projects.map((project) => (
            <motion.button
              layoutId={`card-${project.id}`}
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="group bg-card ring-accent relative h-64 cursor-pointer overflow-hidden text-left ring-1 transition-colors duration-150 hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              style={{ borderRadius: "var(--radius)" }}
              transition={
                prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.noBounce
              }
              aria-label={`View details for ${project.title}`}
            >
              {/* Hover arrow indicator */}
              <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 motion-reduce:transition-none">
                <ArrowUpRight
                  size={ICON_CONFIG.sizes.md}
                  strokeWidth={ICON_CONFIG.strokeWidth}
                  className="text-foreground/50"
                />
              </div>

              {/* Image area with layoutId */}
              <motion.div
                layoutId={`image-${project.id}`}
                className="absolute inset-x-0 top-0 h-2/3"
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
                className="absolute inset-x-0 bottom-0 flex h-1/3 flex-col justify-end p-4 md:px-8 md:py-4"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
              >
                <motion.p
                  layoutId={`type-${project.id}`}
                  className="text-foreground/60 mb-2 font-mono text-sm uppercase"
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
                  className="font-serif text-lg"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : SPRING_CONFIG.noBounce
                  }
                >
                  {project.title}
                </motion.h3>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}
