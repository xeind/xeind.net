import { useEffect, useRef, useState, type CSSProperties } from "react";

export type ClaudeAnimationSet = readonly string[];

const THINKING_SPIN_FRAMES = Array.from(
  { length: 5 },
  (_, index) => `/projects/claude-thinking/frame-${index + 4}.svg`,
);

export const CLAUDE_ANIMATION_SETS = [
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

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
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
  const reducedMotion = useReducedMotion();
  const [framesMounted, setFramesMounted] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [activeSet, setActiveSet] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);
  const frameCursors = useRef<number[]>([]);
  const nextSet = useRef(0);
  const wasPlaying = useRef(false);
  const lastActivation = useRef(activation);

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

  useEffect(() => {
    const activationChanged = activation !== lastActivation.current;

    if (playing && (!wasPlaying.current || activationChanged) && animationSets.length > 0) {
      if (activationChanged && resetOnStopSets.includes(activeSet)) {
        frameCursors.current[activeSet] = 0;
      }

      const setIndex = nextSet.current % animationSets.length;
      const frameIndex = frameCursors.current[setIndex] ?? 0;

      setActiveSet(setIndex);
      setActiveFrame(frameIndex);
      nextSet.current = (setIndex + 1) % animationSets.length;
    }

    if (!playing && wasPlaying.current && resetOnStopSets.includes(activeSet)) {
      frameCursors.current[activeSet] = 0;
      setActiveFrame(0);
    }

    wasPlaying.current = playing;
    lastActivation.current = activation;
  }, [activation, activeSet, animationSets.length, playing, resetOnStopSets]);

  useEffect(() => {
    const frames = animationSets[activeSet];
    if (reducedMotion || !playing || !framesReady || !frames?.length) return;

    const frameDelay =
      activeFrame === frames.length - 1
        ? (lastFrameHoldMsBySet[activeSet] ?? frameDuration)
        : frameDuration;
    const timer = window.setTimeout(() => {
      const frameIndex = ((frameCursors.current[activeSet] ?? 0) + 1) % frames.length;
      frameCursors.current[activeSet] = frameIndex;
      setActiveFrame(frameIndex);
    }, frameDelay);

    return () => window.clearTimeout(timer);
  }, [
    activeFrame,
    activeSet,
    animationSets,
    frameDuration,
    framesReady,
    lastFrameHoldMsBySet,
    playing,
    reducedMotion,
  ]);

  const showBase = reducedMotion || !playing || !framesReady;

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
