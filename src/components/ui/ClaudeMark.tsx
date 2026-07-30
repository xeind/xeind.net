import { useEffect, useRef, useState } from "react";
import {
  CLAUDE_BASE_FRAME_PATHS,
  CLAUDE_FRAME_PATH_SETS,
  type ClaudeFramePaths,
} from "@/components/design/claude-frame-paths";

/**
 * The Claude mark drawn as a real 1px outline rather than a silhouette, with
 * the frame-flip behaviour of ClaudeSpinner. Lives here, not in the design
 * page's tile, because the Recognitions section uses the same mark — one
 * implementation, so the two cannot drift.
 */
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
          strokeWidth={1}
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
export function ClaudeMark({ playing, activation }: { playing: boolean; activation: number }) {
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
