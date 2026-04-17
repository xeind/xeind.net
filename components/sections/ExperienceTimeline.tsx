"use client";

import { experiences } from "@/lib/data";
import { Badge, InlineLink } from "@/components/ui";
import { Experience } from "@/lib/types";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";
import { useReducedMotion, useClickSound } from "@/lib/hooks";

interface ExperienceItemProps {
  exp: Experience;
  nudge: () => void;
}

function ExperienceItem({ exp, nudge }: ExperienceItemProps) {
  return (
    <article className="group relative mb-8 flex gap-6 last:mb-0">
      {exp.id !== experiences[experiences.length - 1].id && (
        <div
          aria-hidden="true"
          className="absolute top-3 bottom-0 translate-y-5 z-0"
          style={{
            left: "0.52rem",
            width: 0,
            marginLeft: "calc(var(--divider-thickness) / -2)",
          }}
        >
          <div className="absolute inset-y-0 left-0 border-l border-dashed border-foreground/30 h-full opacity-100 group-hover:opacity-0 group-focus-within:opacity-0 transition-opacity t-border" />
          <div className="absolute inset-y-0 left-0 h-full border-l border-solid border-foreground/30 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 t-border" />
        </div>
      )}

      <div className="relative mt-1 h-4 w-4 shrink-0">
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-accent h-1 w-1" />
        </div>
        <div className="ca-tl" />
        <div className="ca-tr" />
        <div className="ca-bl" />
        <div className="ca-br" />
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <h3 className="text-foreground font-serif text-base">{exp.role}</h3>
          <div className="text-foreground/60 mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {exp.companyUrl ? (
                <span className="inline-block">
                  <InlineLink
                    href={exp.companyUrl}
                    external
                    onHoverSound={nudge}
                    className="font-medium"
                  >
                    {exp.company}
                  </InlineLink>
                </span>
              ) : (
                <span className="font-medium">{exp.company}</span>
              )}
              <div className="bg-foreground/30 h-1 w-1 shrink-0" />
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
    </article>
  );
}

export default function ExperienceTimeline() {
  const prefersReducedMotion = useReducedMotion();
  const { nudge } = useClickSound();

  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">Experience</h2>

      {experiences.map((exp) => (
        <ExperienceItem key={exp.id} exp={exp} nudge={nudge} />
      ))}
    </div>
  );
}
