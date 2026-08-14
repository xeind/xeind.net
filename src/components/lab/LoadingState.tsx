import { useEffect, useState } from "react";
import PixelGrid, { type PixelPattern } from "./PixelGrid";

/**
 * The wavefront grid with an elapsed timer beside it.
 *
 * Agent work has no known end, so a determinate bar would lie. The grid says
 * "still running"; the timer says how long you have been waiting. Between them
 * there is no progress claim, which is the honest state.
 *
 * Reduced motion freezes the grid (see PixelGrid). The timer still ticks — it
 * is information, not decoration.
 */

function useElapsed(): string {
  const [ms, setMs] = useState(0);

  useEffect(() => {
    // Read the clock instead of counting ticks. setInterval drifts under load,
    // and a timer that runs slow next to a real one is worse than no timer.
    const start = performance.now();
    const id = window.setInterval(() => setMs(performance.now() - start), 100);
    return () => window.clearInterval(id);
  }, []);

  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
}

interface LoadingStateProps {
  label?: string;
  pattern?: PixelPattern;
  className?: string;
}

export default function LoadingState({
  label = "Reading the repo",
  pattern = "drive",
  className = "",
}: LoadingStateProps) {
  const elapsed = useElapsed();

  return (
    <div className={`flex w-fit items-center gap-3 ${className}`}>
      <PixelGrid pattern={pattern} />

      {/* No aria-live: a timer announcing itself every 100ms makes the page
          unusable with a screen reader. The label carries the status. */}
      <span role="status" className="text-foreground/70 font-mono text-[0.6875rem] tracking-wide">
        {label}
      </span>

      <span
        className="text-foreground/50 font-mono text-[0.6875rem] tabular-nums"
        aria-hidden="true"
      >
        {elapsed}
      </span>
    </div>
  );
}
