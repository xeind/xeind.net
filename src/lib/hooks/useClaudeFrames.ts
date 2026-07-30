import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * The Claude mark's frame-flip state machine, shared by ClaudeSpinner (masked
 * silhouette frames) and ClaudeMark (outlined inline-SVG frames) so the two
 * cannot drift.
 *
 * Behaviour: successive activations alternate through the animation sets
 * (orbit, thinking, …). Sets listed in `resetOnStopSets` restart from frame 0
 * when playback stops or re-triggers; the others resume where they left off.
 * A set's last frame can hold longer than `frameDuration` via
 * `lastFrameHoldMsBySet`.
 */
export function useClaudeFrames({
  playing,
  activation,
  frameCounts,
  frameDuration = 90,
  resetOnStopSets = [1],
  lastFrameHoldMsBySet = { 1: 1400 },
  ready = true,
}: {
  playing: boolean;
  /** Ticks on each activation so a re-hover restarts instead of resuming. */
  activation?: number | string;
  /** Frames per set, e.g. [8, 10]. */
  frameCounts: readonly number[];
  frameDuration?: number;
  resetOnStopSets?: readonly number[];
  lastFrameHoldMsBySet?: Readonly<Record<number, number>>;
  /** Gate for callers that preload frames before animating. */
  ready?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [activeSet, setActiveSet] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);
  const frameCursors = useRef<number[]>([]);
  const nextSet = useRef(0);
  const wasPlaying = useRef(false);
  const lastActivation = useRef(activation);

  useEffect(() => {
    const activationChanged = activation !== lastActivation.current;

    if (playing && (!wasPlaying.current || activationChanged) && frameCounts.length > 0) {
      if (activationChanged && resetOnStopSets.includes(activeSet)) {
        frameCursors.current[activeSet] = 0;
      }

      const setIndex = nextSet.current % frameCounts.length;
      setActiveSet(setIndex);
      setActiveFrame(frameCursors.current[setIndex] ?? 0);
      nextSet.current = (setIndex + 1) % frameCounts.length;
    }

    if (!playing && wasPlaying.current && resetOnStopSets.includes(activeSet)) {
      frameCursors.current[activeSet] = 0;
      setActiveFrame(0);
    }

    wasPlaying.current = playing;
    lastActivation.current = activation;
  }, [activation, activeSet, frameCounts.length, playing, resetOnStopSets]);

  useEffect(() => {
    const count = frameCounts[activeSet] ?? 0;
    if (reducedMotion || !playing || !ready || count === 0) return;

    const frameDelay =
      activeFrame === count - 1
        ? (lastFrameHoldMsBySet[activeSet] ?? frameDuration)
        : frameDuration;
    const timer = window.setTimeout(() => {
      const frameIndex = ((frameCursors.current[activeSet] ?? 0) + 1) % count;
      frameCursors.current[activeSet] = frameIndex;
      setActiveFrame(frameIndex);
    }, frameDelay);

    return () => window.clearTimeout(timer);
  }, [
    activeFrame,
    activeSet,
    frameCounts,
    frameDuration,
    lastFrameHoldMsBySet,
    playing,
    ready,
    reducedMotion,
  ]);

  return { activeSet, activeFrame, showBase: reducedMotion || !playing || !ready };
}
