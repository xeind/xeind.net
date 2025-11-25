"use client";

import { motion } from "motion/react";
import { personalInfo } from "@/lib/data";
import { SPRING_CONFIG } from "@/lib/config/animation";
import { STACK_SPACING } from "@/lib/config/spacing";

export default function AboutSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={SPRING_CONFIG.default}
      className={STACK_SPACING.comfortable}
    >
      <h2 className="text-foreground font-serif text-xl">About</h2>
      <div
        className={`text-foreground/80 ${STACK_SPACING.normal} text-base leading-relaxed`}
      >
        <p>{personalInfo.bio}</p>
        <p>
          I focus on building scalable systems with clean architecture and
          exceptional user experiences. My work emphasizes performance,
          accessibility, and maintainability.
        </p>
        <p>
          When I'm not coding, I explore design systems, contribute to open
          source, and experiment with emerging web technologies.
        </p>
      </div>
    </motion.div>
  );
}
