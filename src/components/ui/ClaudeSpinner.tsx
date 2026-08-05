import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useClaudeFrames } from "@/lib/hooks/useClaudeFrames";

export type ClaudeAnimationSet = readonly string[];

const THINKING_SPIN_FRAMES = Array.from(
  { length: 5 },
  (_, index) => `/projects/claude-thinking/frame-${index + 4}.svg`,
);

const CLAUDE_ANIMATION_SETS = [
  Array.from({ length: 8 }, (_, index) => `/projects/claude-mark/frame-${index + 1}.svg`),
  [
    "/projects/claude-thinking/frame-2.svg",
    "/projects/claude-thinking/frame-3.svg",
    ...THINKING_SPIN_FRAMES,
    "/projects/claude-thinking/frame-9.svg",
    "/projects/claude-thinking/frame-10.svg",
    "/projects/claude-thinking/frame-base.svg",
  ],
] as const satisfies readonly ClaudeAnimationSet[];

export type ClaudeSpinnerProps = {
  playing?: boolean;
  activation?: number | string;
  size?: number;
  color?: string;
  frameDuration?: number;
  baseFrame?: string;
  animationSets?: readonly ClaudeAnimationSet[];
  resetOnStopSets?: readonly number[];
  lastFrameHoldMsBySet?: Readonly<Record<number, number>>;
  label?: string;
  className?: string;
};

const DEFAULT_BASE_FRAME = "/projects/claude-mark/frame-base.svg";
const DEFAULT_RESET_ON_STOP_SETS = [1] as const;
const DEFAULT_LAST_FRAME_HOLD_MS_BY_SET = { 1: 1400 } as const;
const framePreloads = new Map<string, Promise<void>>();
let pageLoaded: Promise<void> | undefined;

function waitForPageLoad() {
  pageLoaded ??= new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }

    window.addEventListener("load", () => window.setTimeout(resolve, 0), {
      once: true,
    });
  });

  return pageLoaded;
}

function preloadFrame(src: string) {
  const cached = framePreloads.get(src);
  if (cached) return cached;

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

  framePreloads.set(src, preload);
  return preload;
}

function preloadAnimationSets(animationSets: readonly ClaudeAnimationSet[]) {
  return waitForPageLoad().then(() =>
    Promise.all(animationSets.flatMap((frames) => frames.map(preloadFrame))).then(() => undefined),
  );
}

function frameMaskStyle(src: string, visible: boolean): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundColor: "currentColor",
    opacity: visible ? 1 : 0,
    willChange: "opacity",
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

export default function ClaudeSpinner({
  playing = false,
  activation,
  size = 64,
  color,
  frameDuration = 90,
  baseFrame = DEFAULT_BASE_FRAME,
  animationSets = CLAUDE_ANIMATION_SETS,
  resetOnStopSets = DEFAULT_RESET_ON_STOP_SETS,
  lastFrameHoldMsBySet = DEFAULT_LAST_FRAME_HOLD_MS_BY_SET,
  label = "Claude mark",
  className,
}: ClaudeSpinnerProps) {
  const [framesMounted, setFramesMounted] = useState(false);
  const [framesReady, setFramesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void preloadAnimationSets(animationSets).then(() => {
      if (!cancelled) setFramesMounted(true);
    });

    return () => {
      cancelled = true;
    };
  }, [animationSets]);

  useEffect(() => {
    if (!framesMounted) return;

    let secondPaint: number | undefined;
    const firstPaint = window.requestAnimationFrame(() => {
      secondPaint = window.requestAnimationFrame(() => setFramesReady(true));
    });

    return () => {
      window.cancelAnimationFrame(firstPaint);
      if (secondPaint !== undefined) window.cancelAnimationFrame(secondPaint);
    };
  }, [framesMounted]);

  const frameCounts = useMemo(() => animationSets.map((frames) => frames.length), [animationSets]);

  // Frame-flip state machine shared with ClaudeMark — one implementation, so
  // the outlined mark and this masked one cannot drift.
  const { activeSet, activeFrame, showBase } = useClaudeFrames({
    playing,
    activation,
    frameCounts,
    frameDuration,
    resetOnStopSets,
    lastFrameHoldMsBySet,
    ready: framesReady,
  });

  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{
        position: "relative",
        zIndex: 10,
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: size,
        color,
        lineHeight: 0,
        verticalAlign: "middle",
      }}
    >
      <span aria-hidden="true" style={frameMaskStyle(baseFrame, showBase)} />

      {framesMounted &&
        animationSets.flatMap((frames, setIndex) =>
          frames.map((frame, frameIndex) => (
            <span
              key={`${setIndex}:${frameIndex}:${frame}`}
              aria-hidden="true"
              style={frameMaskStyle(
                frame,
                !showBase && activeSet === setIndex && activeFrame === frameIndex,
              )}
            />
          )),
        )}
    </span>
  );
}
