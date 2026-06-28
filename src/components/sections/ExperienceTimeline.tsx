import { experiences } from "@/lib/data/experience";
import Badge from "@/components/ui/Badge";
import type { Experience } from "@/lib/types";
import { STACK_SPACING, GAP_SPACING } from "@/lib/config/spacing";

const inlineLinkClass =
  "inline border-b border-dashed border-accent/30 pb-px text-accent transition-all hover:border-solid hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface ExperienceItemProps {
  exp: Experience;
}

function ExperienceItem({ exp }: ExperienceItemProps) {
  return (
    <article className="group relative mb-8 flex gap-6 last:mb-0">
      {exp.id !== experiences[experiences.length - 1].id && (
        <div
          aria-hidden="true"
          className="absolute top-3 bottom-0 z-0 translate-y-5"
          style={{
            left: "0.52rem",
            width: 0,
            marginLeft: "calc(var(--divider-thickness) / -2)",
          }}
        >
          <div className="border-foreground/30 t-border absolute inset-y-0 left-0 h-full border-l border-dashed opacity-100 transition-opacity group-focus-within:opacity-0 group-hover:opacity-0" />
          <div className="border-foreground/30 t-border absolute inset-y-0 left-0 h-full border-l border-solid opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" />
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
          <div className="text-foreground/60 mt-1 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {exp.companyUrl ? (
                <span className="inline-block">
                  <a
                    href={exp.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hero-sfx="click"
                    aria-label={`${exp.company} (opens in new tab)`}
                    className="font-medium"
                  >
                    <span className={inlineLinkClass}>{exp.company}</span>
                  </a>
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
  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">Experience</h2>

      {experiences.map((exp) => (
        <ExperienceItem key={exp.id} exp={exp} />
      ))}
    </div>
  );
}
