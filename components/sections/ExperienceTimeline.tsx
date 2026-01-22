"use client";

import { motion } from "motion/react";
import { experiences } from "@/lib/data";
import { Badge } from "@/components/ui";
import { SPRING_CONFIG, DURATION, EASING } from "@/lib/config/animation";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";
import { useReducedMotion } from "@/lib/hooks";

export default function ExperienceTimeline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">Experience</h2>

      {experiences.map((exp, index) => {
        return (
          <motion.article
            key={exp.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    ...SPRING_CONFIG.default,
                    delay: index * 0.1,
                  }
            }
            className="group mb-8 flex gap-6 last:mb-0"
          >
            {/* Expandable Square - Left Side */}
            <div className="relative mt-1 h-4 w-4 shrink-0">
              {/* Center square - STATIC */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-accent h-1 w-1" />
              </div>

              {/* Top-Left Corner - moves up and left */}
              <div
                className="absolute left-0 top-0 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1"
                style={{
                  transitionDuration: `${DURATION.normal}s`,
                  transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                }}
              >
                <div
                  className="bg-accent h-px w-1 transition-all group-hover:w-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
                <div
                  className="bg-accent h-1 w-px transition-all group-hover:h-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
              </div>

              {/* Top-Right Corner - moves up and right */}
              <div
                className="absolute right-0 top-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                style={{
                  transitionDuration: `${DURATION.normal}s`,
                  transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                }}
              >
                <div
                  className="bg-accent ml-auto h-px w-1 transition-all group-hover:w-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
                <div
                  className="bg-accent ml-auto h-1 w-px transition-all group-hover:h-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
              </div>

              {/* Bottom-Left Corner - moves down and left */}
              <div
                className="absolute bottom-0 left-0 transition-all group-hover:-translate-x-1 group-hover:translate-y-1"
                style={{
                  transitionDuration: `${DURATION.normal}s`,
                  transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                }}
              >
                <div
                  className="bg-accent h-1 w-px transition-all group-hover:h-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
                <div
                  className="bg-accent h-px w-1 transition-all group-hover:w-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
              </div>

              {/* Bottom-Right Corner - moves down and right */}
              <div
                className="absolute bottom-0 right-0 transition-all group-hover:translate-x-1 group-hover:translate-y-1"
                style={{
                  transitionDuration: `${DURATION.normal}s`,
                  transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                }}
              >
                <div
                  className="bg-accent ml-auto h-1 w-px transition-all group-hover:h-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
                <div
                  className="bg-accent ml-auto h-px w-1 transition-all group-hover:w-2 group-hover:bg-tertiary"
                  style={{
                    transitionDuration: `${DURATION.normal}s`,
                    transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
                  }}
                />
              </div>
            </div>

            {/* Content - Right Side */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-foreground font-serif text-base">
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
              <ul
                className={`text-foreground/80 ${STACK_SPACING.tight} text-sm`}
              >
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx} className={`flex ${GAP_SPACING.xs}`}>
                    <span className="bg-foreground/40 mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className={`mt-4 flex flex-wrap ${GAP_SPACING.xs}`}>
                  {exp.technologies.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
