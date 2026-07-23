import { useState } from "react";
import ClaudeSpinner from "@/components/ui/ClaudeSpinner";

function ClaudeProjectTile() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverSession, setHoverSession] = useState(0);

  return (
    <article
      tabIndex={0}
      onPointerEnter={() => {
        setHovered(true);
        setHoverSession((session) => session + 1);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="group bg-card focus-visible:ring-accent focus-visible:ring-offset-background relative aspect-square w-full max-w-64 overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="Claude SVG frame animation sample"
    >
      <div className="border-accent/30 group-hover:border-tertiary/50 absolute inset-0 z-10 border border-dashed transition-colors group-hover:border-solid group-focus-visible:border-solid motion-reduce:transition-none" />

      <div className="bg-muted border-accent/30 absolute inset-x-0 top-0 flex h-1/2 items-center justify-center border-b border-dashed">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-20" />
        <ClaudeSpinner
          playing={hovered || focused}
          activation={hoverSession}
          color="var(--color-foreground)"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col p-4">
        <p className="text-accent mb-1 font-mono text-[0.6875rem] tracking-wide">MOTION · SVG</p>
        <h3 className="text-foreground font-serif text-base">Claude frame study</h3>
        <p className="text-foreground/60 mt-auto text-xs">8-frame orbit · 10-frame thinking</p>
      </div>
    </article>
  );
}

function ClaudePlateTile() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverSession, setHoverSession] = useState(0);

  return (
    <article
      tabIndex={0}
      onPointerEnter={() => {
        setHovered(true);
        setHoverSession((session) => session + 1);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="group bg-muted focus-visible:ring-accent focus-visible:ring-offset-background relative aspect-square w-full max-w-64 overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="Claude SVG cohort plate animation sample"
    >
      <div className="border-accent/30 group-hover:border-tertiary/50 absolute inset-0 z-10 border border-dashed transition-colors group-hover:border-solid group-focus-visible:border-solid motion-reduce:transition-none" />
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />

      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute top-0 left-0 z-20 h-px w-2 transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute top-0 left-0 z-20 h-2 w-px transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute top-0 right-0 z-20 h-px w-2 transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute top-0 right-0 z-20 h-2 w-px transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute bottom-0 left-0 z-20 h-px w-2 transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute bottom-0 left-0 z-20 h-2 w-px transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute right-0 bottom-0 z-20 h-px w-2 transition-colors motion-reduce:transition-none" />
      <span className="bg-accent group-hover:bg-tertiary group-focus-visible:bg-tertiary absolute right-0 bottom-0 z-20 h-2 w-px transition-colors motion-reduce:transition-none" />

      <div className="absolute inset-0 flex items-center justify-center">
        <ClaudeSpinner
          playing={hovered || focused}
          activation={hoverSession}
          color="var(--color-foreground)"
        />
      </div>

      <span className="text-accent absolute bottom-2 left-3 z-20 font-mono text-[0.6875rem] tracking-wide">
        Cohort
      </span>
      <span className="text-foreground/40 absolute right-3 bottom-2 z-20 font-mono text-[0.625rem] tracking-wide">
        FIG.01
      </span>
    </article>
  );
}

export default function ClaudeFrameTile() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
      <ClaudeProjectTile />
      <ClaudePlateTile />
    </div>
  );
}
