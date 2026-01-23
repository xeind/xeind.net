"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { experiences } from "@/lib/data";
import { Badge, InlineLink } from "@/components/ui";
import { Experience } from "@/lib/types";
import { SPRING_CONFIG, DURATION, EASING } from "@/lib/config/animation";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";
import { useReducedMotion } from "@/lib/hooks";

interface ExperienceItemProps {
  exp: Experience;
  index: number;
  prefersReducedMotion: boolean;
}

function ExperienceItem({
  exp,
  index,
  prefersReducedMotion,
}: ExperienceItemProps) {
  const [isCompanyHovered, setIsCompanyHovered] = useState(false);

  const hoverHandlers = {
    onMouseEnter: () => setIsCompanyHovered(true),
    onMouseLeave: () => setIsCompanyHovered(false),
    onFocus: () => setIsCompanyHovered(true),
    onBlur: () => setIsCompanyHovered(false),
  };

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
      className="relative mb-8 flex gap-6 last:mb-0"
    >
      {index < experiences.length - 1 && (
        <div
          aria-hidden="true"
          className="absolute top-3 bottom-0 border-l border-dashed border-accent/30 translate-y-5 z-0"
          style={{
            left: "0.52rem",
            width: 0,
            marginLeft: "calc(var(--divider-thickness) / -2)",
          }}
        />
      )}

      <div className="relative mt-1 h-4 w-4 shrink-0">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-accent h-1 w-1" />
        </div>

        <div
          className={`absolute left-0 top-0 transition-all ${
            isCompanyHovered ? "-translate-x-1 -translate-y-1" : ""
          }`}
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
          }}
        >
          <div
            className={`bg-accent h-px w-1 transition-all ${
              isCompanyHovered ? "w-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
          <div
            className={`bg-accent h-1 w-px transition-all ${
              isCompanyHovered ? "h-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
        </div>

        <div
          className={`absolute right-0 top-0 transition-all ${
            isCompanyHovered ? "translate-x-1 -translate-y-1" : ""
          }`}
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
          }}
        >
          <div
            className={`bg-accent ml-auto h-px w-1 transition-all ${
              isCompanyHovered ? "w-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
          <div
            className={`bg-accent ml-auto h-1 w-px transition-all ${
              isCompanyHovered ? "h-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
        </div>

        <div
          className={`absolute bottom-0 left-0 transition-all ${
            isCompanyHovered ? "-translate-x-1 translate-y-1" : ""
          }`}
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
          }}
        >
          <div
            className={`bg-accent h-1 w-px transition-all ${
              isCompanyHovered ? "h-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
          <div
            className={`bg-accent h-px w-1 transition-all ${
              isCompanyHovered ? "w-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
        </div>

        <div
          className={`absolute bottom-0 right-0 transition-all ${
            isCompanyHovered ? "translate-x-1 translate-y-1" : ""
          }`}
          style={{
            transitionDuration: `${DURATION.normal}s`,
            transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
          }}
        >
          <div
            className={`bg-accent ml-auto h-1 w-px transition-all ${
              isCompanyHovered ? "h-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
          <div
            className={`bg-accent ml-auto h-px w-1 transition-all ${
              isCompanyHovered ? "w-2 bg-tertiary" : ""
            }`}
            style={{
              transitionDuration: `${DURATION.normal}s`,
              transitionTimingFunction: `cubic-bezier(${EASING.ease.join(",")})`,
            }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-foreground font-serif text-base">{exp.role}</h3>
          <div className="text-foreground/60 mt-1 flex items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {exp.companyUrl ? (
                <span {...hoverHandlers} className="inline-block">
                  <InlineLink
                    href={exp.companyUrl}
                    external
                    className="font-medium"
                  >
                    {exp.company}
                  </InlineLink>
                </span>
              ) : (
                <span className="font-medium" {...hoverHandlers}>
                  {exp.company}
                </span>
              )}
              <span>·</span>
              <span>{exp.location}</span>
            </div>

            <div className="shrink-0">
              {exp.period.start} – {exp.period.end}
            </div>
          </div>
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed">
          {exp.description}
        </p>

        {exp.technologies && exp.technologies.length > 0 && (
          <div className={`mt-4 flex flex-wrap ${GAP_SPACING.xs}`}>
            {exp.technologies.map((tech: string) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function ExperienceTimeline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">Experience</h2>

      {experiences.map((exp, index) => (
        <ExperienceItem
          key={exp.id}
          exp={exp}
          index={index}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
