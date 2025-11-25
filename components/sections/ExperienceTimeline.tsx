"use client";

import { motion } from "motion/react";
import { experiences } from "@/lib/data";
import { SPRING_CONFIG } from "@/lib/config/animation";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

export default function ExperienceTimeline() {
  return (
    <div className={STACK_SPACING.loose}>
      <h2 className="text-foreground font-serif text-sm font-bold">
        Experience
      </h2>

      <div className={STACK_SPACING.loose}>
        {experiences.map((exp, index) => (
          <motion.article
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              ...SPRING_CONFIG.default,
              delay: index * 0.1,
            }}
            className="before:bg-accent after:bg-border relative pl-8 before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:content-[''] after:absolute after:top-4 after:left-[3px] after:h-full after:w-[2px] after:content-[''] last:after:hidden"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-foreground font-serif text-sm font-bold">
                {exp.role}
              </h3>
              <div className="text-foreground/60 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm">
                <span className="font-medium">{exp.company}</span>
                <span>·</span>
                <span>{exp.location}</span>
                <span>·</span>
                <span>
                  {exp.period.start} – {exp.period.end}
                </span>
              </div>
            </div>

            {/* Achievements */}
            <ul className={`text-foreground/80 ${STACK_SPACING.tight} text-sm`}>
              {exp.achievements.map((achievement, idx) => (
                <li key={idx} className={`flex ${GAP_SPACING.xs}`}>
                  <span className="bg-foreground/40 mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>

            {/* Technologies */}
            {exp.technologies && exp.technologies.length > 0 && (
              <div className={`mt-4 flex flex-wrap ${GAP_SPACING.xs}`}>
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-muted/50 text-foreground/70 ring-border rounded-full px-3 py-1 font-mono text-sm ring-1"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </div>
  );
}
