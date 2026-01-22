"use client";

import { motion } from "motion/react";
import { SPRING_CONFIG } from "@/lib/config/animation";
import { STACK_SPACING } from "@/lib/config/spacing";
import InlineLink from "@/components/ui/InlineLink";
import { useReducedMotion } from "@/lib/hooks";

export default function AboutSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={
        prefersReducedMotion ? { duration: 0 } : SPRING_CONFIG.default
      }
      className={STACK_SPACING.normal}
    >
      <h2 className="text-foreground font-serif text-2xl">About</h2>
      <div
        className={`text-foreground/80 ${STACK_SPACING.normal} text-sm leading-relaxed`}
      >
        <p>
          Full-stack engineer specializing in frontend development. Focused on
          creating intuitive user experiences, thoughtful design, and building
          interfaces that feel right to use.
        </p>
        <p>
          Enjoys working with{" "}
          <InlineLink href="https://github.com/xeind">
            open-source tools
          </InlineLink>
          , experimenting with custom configurations, and self-hosted
          environments to improve developer workflows.
        </p>
      </div>
    </motion.div>
  );
}
