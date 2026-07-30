import {
  CLAUDE_BASE_FRAME_PATHS,
  CLAUDE_FRAME_PATH_SETS,
  type ClaudeFramePaths,
} from "@/lib/claude-frame-paths";
import { useClaudeFrames } from "@/lib/hooks/useClaudeFrames";

interface ClaudeMarkProps {
  playing: boolean;
  /** Ticks on each activation so a re-hover restarts instead of resuming. */
  activation: number;
}

const FRAME_COUNTS = CLAUDE_FRAME_PATH_SETS.map((frames) => frames.length);

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

/**
 * Claude mark in StageFigure's plate styling (GridIterations.tsx) — bg-card
 * fill with a real 1px accent/60 outline. Inline SVGs, since a CSS mask can
 * only produce solid silhouettes, never a stroke. The frame-flip behaviour
 * (alternating orbit/thinking sets on successive hovers) is useClaudeFrames,
 * shared with ClaudeSpinner so the two cannot drift.
 */
export default function ClaudeMark({ playing, activation }: ClaudeMarkProps) {
  const { activeSet, activeFrame, showBase } = useClaudeFrames({
    playing,
    activation,
    frameCounts: FRAME_COUNTS,
  });

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
