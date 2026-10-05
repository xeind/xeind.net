import { experiences } from "@/lib/data/experience";
import Badge from "@/components/ui/Badge";
import type { CSSProperties } from "react";
import type { Experience } from "@/lib/types";

const inlineLinkClass =
  "inline border-b border-dashed border-accent/30 pb-px text-accent transition-colors hover:border-solid hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const currentExperiences = experiences.filter((exp) => !exp.archived);
const archivedExperiences = experiences.filter((exp) => exp.archived);

// Earlier roles stream in when the toggle opens, like StreamingText in /lab
// but in CSS alone: every piece is server-rendered with its own animation
// delay, so the section stays static markup with no island. One clock runs
// the whole role: the title, the meta row and each badge rise in a step
// apart, while the description streams word by word from the badges' first
// step. The badges don't wait for the text to finish. The rate matches
// StreamingText's WORD_MS: ~18 words a second, close to a fast model's
// output.
const STREAM_WORD_MS = 55;
// The second role starts a beat after the first, not after it finishes.
const STREAM_ROLE_OFFSET_MS = 80;

function streamDelay(startMs: number, step: number): CSSProperties {
  return { "--word-delay": `${startMs + step * STREAM_WORD_MS}ms` } as CSSProperties;
}

interface StreamedWordsProps {
  text: string;
  startMs: number;
  firstStep: number;
}

function StreamedWords({ text, startMs, firstStep }: StreamedWordsProps) {
  const words = text.split(" ");
  return words.map((word, index) => (
    <span key={index} className="timeline-word" style={streamDelay(startMs, firstStep + index)}>
      {index < words.length - 1 ? `${word} ` : word}
    </span>
  ));
}

const spineOffsetStyle = {
  left: "0.52rem",
  width: 0,
  marginLeft: "calc(var(--divider-thickness) / -2)",
};

// The dashed line from one marker down to the next.
function TimelineSpine() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-3 bottom-0 z-0 translate-y-5"
      style={spineOffsetStyle}
    >
      <div className="border-foreground/30 t-border group-keyboard:opacity-0 absolute inset-y-0 left-0 h-full border-l border-dashed opacity-100 transition-opacity group-hover:opacity-0" />
      <div className="border-foreground/30 t-border group-keyboard:opacity-100 absolute inset-y-0 left-0 h-full border-l border-solid opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function TimelineMarker() {
  return (
    <div className="relative mt-1 h-4 w-4 shrink-0">
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="bg-accent h-1 w-1" />
      </div>
      <div className="ca-tl" />
      <div className="ca-tr" />
      <div className="ca-bl" />
      <div className="ca-br" />
    </div>
  );
}

interface ExperienceItemProps {
  exp: Experience;
  hasNext: boolean;
  // Set on earlier roles: when their description starts streaming.
  streamStartMs?: number;
  // The first earlier role: the open toggle sits where its marker would be,
  // so it keeps only the marker's space. A second marker under the toggle
  // read as a smaller square inside it.
  markerless?: boolean;
}

function ExperienceItem({ exp, hasNext, streamStartMs, markerless = false }: ExperienceItemProps) {
  const streams = streamStartMs !== undefined;
  const startMs = streamStartMs ?? 0;
  const descriptionStep = 2;
  const badgeStep = 2;
  return (
    <article
      className="group relative mb-8 flex gap-6 last:mb-0"
      style={streams ? ({ "--caret-ms": `${STREAM_WORD_MS}ms` } as CSSProperties) : undefined}
    >
      {hasNext && <TimelineSpine />}

      {markerless ? <div className="mt-1 h-4 w-4 shrink-0" /> : <TimelineMarker />}

      <div className="flex-1">
        <div className="mb-4">
          <h3
            className={`text-foreground font-serif text-base leading-6 ${streams ? "timeline-step" : ""}`}
            style={streams ? streamDelay(startMs, 0) : undefined}
          >
            {exp.role}
          </h3>
          <div
            className={`text-foreground/60 mt-2 flex flex-col gap-2 text-sm leading-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${streams ? "timeline-step" : ""}`}
            style={streams ? streamDelay(startMs, 1) : undefined}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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

            <div className="shrink-0 font-mono text-xs">
              {exp.period.start} – {exp.period.end}
            </div>
          </div>
        </div>

        <p className="text-foreground/80 text-sm leading-6">
          {streams ? (
            <StreamedWords text={exp.description} startMs={startMs} firstStep={descriptionStep} />
          ) : (
            exp.description
          )}
        </p>

        {exp.technologies && exp.technologies.length > 0 && (
          <div className={`mt-4 flex flex-wrap gap-2 ${streams ? "timeline-badges" : ""}`}>
            {exp.technologies.map((tech: string, index: number) => (
              <Badge
                key={tech}
                style={streams ? streamDelay(startMs, badgeStep + index) : undefined}
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function ExperienceTimeline() {
  return (
    <div className="space-y-4">
      <h2 className="text-foreground font-serif text-2xl leading-8">Experience</h2>

      {currentExperiences.map((exp, index) => (
        <ExperienceItem
          key={exp.id}
          exp={exp}
          hasNext={index < currentExperiences.length - 1 || archivedExperiences.length > 0}
        />
      ))}

      {archivedExperiences.length > 0 && (
        <details className="group/earlier relative">
          {/* The marker alone is the toggle. Open, it lifts out of the flow
              and sits exactly where the first earlier role's marker would be
              (that role renders none), so the same square stays under the
              cursor and closes the section again. Swapping in the role's
              marker instead replayed its hover spread from rest. The
              pseudo-element widens the 16px mark to a 32 × 40 hit area.

              mb-2: closed, this is the panel's last row, and a bare 24px
              left the panel half a cell long, so every divider below it sat
              8px off the grid. 24 + 8 is 2 cells. Open, the summary is out
              of flow and the margin does nothing. */}
          <summary
            data-hero-sfx="click"
            className="ca-trigger focus-visible:ring-accent focus-visible:ring-offset-background relative z-20 mb-2 flex h-6 w-4 cursor-pointer list-none group-open/earlier:absolute group-open/earlier:top-0 group-open/earlier:left-0 before:absolute before:-inset-2 before:content-[''] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
          >
            <span className="sr-only">
              <span className="group-open/earlier:hidden">Show</span>
              <span className="hidden group-open/earlier:inline">Hide</span> earlier roles (
              {archivedExperiences.length})
            </span>
            <TimelineMarker />
          </summary>

          <div>
            {archivedExperiences.map((exp, index) => (
              <ExperienceItem
                key={exp.id}
                exp={exp}
                hasNext={index < archivedExperiences.length - 1}
                streamStartMs={index * STREAM_ROLE_OFFSET_MS}
                markerless={index === 0}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
