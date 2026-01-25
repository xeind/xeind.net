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
          I&apos;m a full‑stack engineer who loves building beautiful UIs. I
          obsess over microinteractions, motion, and polish. Currently working
          at <InlineLink href="https://www.pioneerdev.ai/">Pioneer</InlineLink>.
        </p>

        <p>
          I enjoy using open‑source tools and experiment with custom configs and
          self‑hosted environments to improve developer workflows.
        </p>
      </div>
    </motion.div>
  );
}
