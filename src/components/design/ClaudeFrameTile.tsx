import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const BASE_FRAME = "/projects/claude-mark/frame-base.svg";
const ANIMATION_FRAMES = Array.from(
  { length: 8 },
  (_, index) => `/projects/claude-mark/frame-${index + 1}.svg`,
);
const FRAME_DURATION_MS = 90;

let framePreload: Promise<void> | undefined;
let postLoadFramePreload: Promise<void> | undefined;

function preloadFrames() {
  framePreload ??= Promise.all(
    ANIMATION_FRAMES.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = src;
        }),
    ),
  ).then(() => undefined);

  return framePreload;
}

function preloadFramesAfterPageLoad() {
  postLoadFramePreload ??= new Promise<void>((resolve) => {
    const startPreload = () => {
      void preloadFrames().then(resolve);
    };

    if (document.readyState === "complete") {
      startPreload();
    } else {
      window.addEventListener("load", startPreload, { once: true });
    }
  });

  return postLoadFramePreload;
}

function ClaudeFrameMark({ playing }: { playing: boolean }) {
  const reducedMotion = useReducedMotion();
  const [src, setSrc] = useState(BASE_FRAME);
  const frameIndex = useRef(-1);

  useEffect(() => {
    void preloadFramesAfterPageLoad();
  }, []);

  useEffect(() => {
    if (reducedMotion || !playing) return;

    let cancelled = false;
    let timer: number | undefined;

    void preloadFramesAfterPageLoad().then(() => {
      if (cancelled) return;

      if (frameIndex.current === -1) {
        frameIndex.current = 0;
        setSrc(ANIMATION_FRAMES[0]);
      }

      timer = window.setInterval(() => {
        frameIndex.current = (frameIndex.current + 1) % ANIMATION_FRAMES.length;
        setSrc(ANIMATION_FRAMES[frameIndex.current]);
      }, FRAME_DURATION_MS);
    });

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [playing, reducedMotion]);

  const displayedSrc = reducedMotion || !playing ? BASE_FRAME : src;
  const maskStyle = {
    WebkitMaskImage: `url("${displayedSrc}")`,
    maskImage: `url("${displayedSrc}")`,
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };

  return (
    <span role="img" aria-label="Claude mark" className="relative z-10 block h-16 w-16">
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          ...maskStyle,
          backgroundColor: "var(--color-foreground)",
        }}
      />
    </span>
  );
}

function ClaudeProjectTile() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <article
      tabIndex={0}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="group bg-card focus-visible:ring-accent focus-visible:ring-offset-background relative aspect-square w-full max-w-64 overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="Claude SVG frame animation sample"
    >
      <div className="border-accent/30 group-hover:border-tertiary/50 absolute inset-0 z-10 border border-dashed transition-colors group-hover:border-solid group-focus-visible:border-solid motion-reduce:transition-none" />

      <div className="bg-muted border-accent/30 absolute inset-x-0 top-0 flex h-1/2 items-center justify-center border-b border-dashed">
        <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-20" />
        <ClaudeFrameMark playing={hovered || focused} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col p-4">
        <p className="text-accent mb-1 font-mono text-[0.6875rem] tracking-wide">MOTION · SVG</p>
        <h3 className="text-foreground font-serif text-base">Claude frame study</h3>
        <p className="text-foreground/60 mt-auto text-xs">Eight traced vector frames</p>
      </div>
    </article>
  );
}

function ClaudePlateTile() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <article
      tabIndex={0}
      onPointerEnter={() => setHovered(true)}
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
        <ClaudeFrameMark playing={hovered || focused} />
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
