import { useEffect, useRef, useState } from "react";
import ClaudeSpinner from "@/components/ui/ClaudeSpinner";
import {
  CLAUDE_BASE_FRAME_PATHS,
  CLAUDE_FRAME_PATH_SETS,
  type ClaudeFramePaths,
} from "./claude-frame-paths";

function OutlinedFrame({ frame, visible }: { frame: ClaudeFramePaths; visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={frame.viewBox}
      className="fill-card stroke-accent/60 absolute inset-0 h-full w-full"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {frame.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          strokeWidth={0.4}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

const OUTLINED_FRAME_DURATION = 90;
const OUTLINED_THINKING_SET = 1;
const OUTLINED_LAST_FRAME_HOLD_MS = 1400;

/**
 * Claude mark in StageFigure's plate styling (GridIterations.tsx) — bg-card
 * fill with a real 1px accent/60 outline — driven by the same frame-flip
 * behavior as ClaudeSpinner (alternating orbit/thinking sets on successive
 * hovers). Inline SVGs, since a CSS mask can only produce solid
 * silhouettes, never a stroke.
 */
function OutlinedClaudeSpinner({ playing, activation }: { playing: boolean; activation: number }) {
  const [activeSet, setActiveSet] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);
  const frameCursors = useRef<number[]>([]);
  const nextSet = useRef(0);
  const wasPlaying = useRef(false);
  const lastActivation = useRef(activation);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const activationChanged = activation !== lastActivation.current;

    if (playing && (!wasPlaying.current || activationChanged)) {
      if (activationChanged && activeSet === OUTLINED_THINKING_SET) {
        frameCursors.current[activeSet] = 0;
      }
      const setIndex = nextSet.current % CLAUDE_FRAME_PATH_SETS.length;
      setActiveSet(setIndex);
      setActiveFrame(frameCursors.current[setIndex] ?? 0);
      nextSet.current = (setIndex + 1) % CLAUDE_FRAME_PATH_SETS.length;
    }

    if (!playing && wasPlaying.current && activeSet === OUTLINED_THINKING_SET) {
      frameCursors.current[activeSet] = 0;
      setActiveFrame(0);
    }

    wasPlaying.current = playing;
    lastActivation.current = activation;
  }, [activation, activeSet, playing]);

  useEffect(() => {
    const frames = CLAUDE_FRAME_PATH_SETS[activeSet];
    if (reducedMotion || !playing || !frames?.length) return;

    const frameDelay =
      activeFrame === frames.length - 1 && activeSet === OUTLINED_THINKING_SET
        ? OUTLINED_LAST_FRAME_HOLD_MS
        : OUTLINED_FRAME_DURATION;
    const timer = window.setTimeout(() => {
      const frameIndex = ((frameCursors.current[activeSet] ?? 0) + 1) % frames.length;
      frameCursors.current[activeSet] = frameIndex;
      setActiveFrame(frameIndex);
    }, frameDelay);

    return () => window.clearTimeout(timer);
  }, [activeFrame, activeSet, playing, reducedMotion]);

  const showBase = reducedMotion || !playing;

  return (
    <span className="relative z-10 inline-block h-20 w-20">
      <OutlinedFrame frame={CLAUDE_BASE_FRAME_PATHS} visible={showBase} />
      {CLAUDE_FRAME_PATH_SETS.map((frames, setIndex) =>
        frames.map((frame, frameIndex) => (
          <OutlinedFrame
            key={`${setIndex}:${frameIndex}`}
            frame={frame}
            visible={!showBase && activeSet === setIndex && activeFrame === frameIndex}
          />
        )),
      )}
    </span>
  );
}

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
      <div className="border-accent/30 absolute inset-0 z-10 border border-dashed transition-all group-hover:border-solid group-focus-visible:border-solid motion-reduce:transition-none" />

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
      <div className="border-accent/30 absolute inset-0 z-10 border border-dashed transition-all group-hover:border-solid group-focus-visible:border-solid motion-reduce:transition-none" />
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 z-0 opacity-20" />

      <div className="absolute inset-0 flex items-center justify-center">
        <OutlinedClaudeSpinner playing={hovered || focused} activation={hoverSession} />
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
