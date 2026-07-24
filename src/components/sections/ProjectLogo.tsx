import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { PROJECT_LOGO_URLS } from "@/lib/data/project-logo-urls";

type ResolvedTheme = "light" | "dark" | "nightingale";

declare global {
  interface Window {
    __projectLogoPreload?: Promise<void>;
  }
}

const THEMES: readonly ResolvedTheme[] = ["light", "dark", "nightingale"];
const EXTERNAL_LOGOS = {
  filipinameet: { file: "fmeet-seo", width: 54, height: 48 },
  slavicmeet: { file: "smeet-seo", width: 392.9, height: 225.3 },
  nightingale: { file: "nightingale", width: 371.62, height: 300.03 },
} as const;

function getExternalLogo(projectId: string) {
  switch (projectId) {
    case "filipinameet":
      return EXTERNAL_LOGOS.filipinameet;
    case "slavicmeet":
      return EXTERNAL_LOGOS.slavicmeet;
    case "nightingale":
      return EXTERNAL_LOGOS.nightingale;
    default:
      return undefined;
  }
}

function getExternalLogoSrc(projectId: string, theme: ResolvedTheme) {
  const logo = getExternalLogo(projectId);
  return logo ? PROJECT_LOGO_URLS[logo.file][theme] : undefined;
}

function preloadAlternateLogos(activeTheme: ResolvedTheme) {
  window.__projectLogoPreload ??= Promise.all(
    Object.values(EXTERNAL_LOGOS).flatMap(({ file }) =>
      THEMES.filter((theme) => theme !== activeTheme).map(
        (theme) =>
          new Promise<void>((imageLoaded) => {
            const image = new Image();
            image.onload = () => imageLoaded();
            image.onerror = () => imageLoaded();
            image.src = PROJECT_LOGO_URLS[file][theme];
          }),
      ),
    ),
  ).then(() => undefined);

  return window.__projectLogoPreload;
}

interface ProjectLogoProps {
  projectId: string;
  theme: ResolvedTheme;
  className?: string;
  alt: string;
}

const ATAX_X = [3, 13, 23, 33, 43] as const;
const ATAX_Y = [0, 10, 20, 30, 40] as const;
const ATAX_COORDS = (() => {
  const coords: Array<{ x: number; y: number }> = [];

  for (const y of ATAX_Y) {
    for (const x of ATAX_X) {
      coords.push({ x, y });
    }
  }

  return coords;
})();
const ATAX_PRIMARY_OPACITY = [
  0.52, 0.72, 0.72, 0.72, 0.52, 0.52, 0.32, 0.32, 0.32, 0.52, 0.52, 0.52, 0.92, 0.52, 0.52, 0.52,
  0.32, 0.32, 0.32, 0.52, 0.72, 0.32, 0.32, 0.32, 0.72,
] as const;
const DEFAULT_ATAX_PRIMARY_ORDER = Array.from({ length: ATAX_COORDS.length }, (_, i) => i);
const DEFAULT_ATAX_SECONDARY_ORDER = [0, 4, 6, 8, 12, 16, 18, 20, 24];
let lastAtaxFrame = {
  primaryOrder: DEFAULT_ATAX_PRIMARY_ORDER,
  secondaryOrder: DEFAULT_ATAX_SECONDARY_ORDER,
};

// ATAX colors resolve via --atax-* CSS variables (global.css) so the SVG
// markup is identical across themes — theme-dependent attributes here would
// desync from SSR output (hydration never patches attribute mismatches).

function shuffleIndices(length: number) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function AtaxLogo({ className, alt }: { className?: string; alt: string }) {
  const [primaryOrder, setPrimaryOrder] = useState<number[]>(() => lastAtaxFrame.primaryOrder);
  const [secondaryOrder, setSecondaryOrder] = useState<number[]>(
    () => lastAtaxFrame.secondaryOrder,
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const shuffled = shuffleIndices(ATAX_COORDS.length);
      const nextSecondaryOrder = shuffled.slice(0, 9);
      lastAtaxFrame = {
        primaryOrder: shuffled,
        secondaryOrder: nextSecondaryOrder,
      };
      setPrimaryOrder(shuffled);
      setSecondaryOrder(nextSecondaryOrder);
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 54 48"
        className="h-full w-auto max-w-full"
      >
        <g fill="var(--atax-primary)" style={{ opacity: "var(--atax-primary-scale, 1)" }}>
          {ATAX_PRIMARY_OPACITY.map((opacity, i) => {
            const coord = ATAX_COORDS[primaryOrder[i]];
            return (
              <rect
                key={`a-${i}`}
                x={coord.x}
                y={coord.y}
                width="8"
                height="8"
                fillOpacity={opacity}
              />
            );
          })}
        </g>
        <g fill="var(--atax-secondary)" style={{ opacity: "var(--atax-secondary-opacity, 0.38)" }}>
          {secondaryOrder.map((coordIdx, i) => {
            const coord = ATAX_COORDS[coordIdx];
            return <rect key={`b-${i}`} x={coord.x} y={coord.y} width="8" height="8" />;
          })}
        </g>
      </svg>
    </span>
  );
}

const PIONEER_P_BODY =
  "M10.33,0c2.68,0,4.94.87,6.76,2.62,1.82,1.75,2.74,3.98,2.74,6.69s-.91,4.94-2.74,6.69c-1.82,1.75-4.08,2.62-6.76,2.62h-2.67c-.48,0-.86.39-.86.86v3.94c0,.49-.39.88-.88.88H.8c-.44,0-.8-.36-.8-.8V.86c0-.48.39-.86.86-.86h9.47Z";

const PIONEER_SPARKLE =
  "M8.71,5.96c.22-1.04,1.68-1.04,1.91,0v.05s.01,0,.01,0c0,.03.01.06.02.1.29,1.25,1.29,2.21,2.54,2.43,1.06.19,1.06,1.74,0,1.92-1.26.22-2.26,1.19-2.54,2.45l-.03.13c-.23,1.03-1.69,1.03-1.91,0l-.02-.12c-.27-1.27-1.27-2.24-2.53-2.46-1.06-.19-1.06-1.73,0-1.92,1.25-.22,2.25-1.19,2.53-2.45l.02-.09v-.04Z";
const YIELD_PATH =
  "M32.43 0H26.2c-1.54 0-3.01.65-4.05 1.79l-.05.06-10.04 10.63c-.35.2-.75.32-1.18.32-.07 0-.14 0-.2 0-1.45-.12-2.32-1.67-1.78-3.02L12.79 0H6.86c-1.3 0-2.46.83-2.88 2.06L.87 11.13c-.85 2.46.81 5.16 3.41 5.34.1 0 .19.01.28.01H5c1.12-.01 2.21-.24 3.22-.67 1-.44 1.92-1.07 2.68-1.89L21.63 2.56c.96-.35 2.06.77 1.43 1.81 0 0-10.38 15.17-13.7 19.81-.19.28-.51.44-.84.44-.57 0-1.03-.46-1.03-1.03v-5.25H0v2.51c0 2.14 1.73 3.88 3.87 3.88l15.26-.02L33.07 1.09c.26-.49-.09-1.09-.64-1.09Z";

const PIONEER_THEME: Record<ResolvedTheme, { body: string }> = {
  light: { body: "var(--color-foreground)" },
  dark: { body: "var(--color-foreground)" },
  nightingale: { body: "var(--color-foreground)" },
};

function PioneerLogo({
  colors,
  alt,
  className,
  reducedMotion,
}: {
  colors: { body: string };
  alt: string;
  className?: string;
  reducedMotion: boolean;
}) {
  const sparkleRef = useCallback((el: SVGPathElement | null) => {
    if (el) {
      el.style.animationDelay = `${-(performance.now() / 1000) % 4}s`;
    }
  }, []);

  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 19.83 24.3"
        className="h-full w-auto max-w-full"
      >
        {reducedMotion ? (
          <path d={`${PIONEER_P_BODY}${PIONEER_SPARKLE}`} fill={colors.body} fillRule="evenodd" />
        ) : (
          <>
            <defs>
              <mask id="pioneer-sparkle-mask">
                <rect width="100%" height="100%" fill="white" />
                <path
                  ref={sparkleRef}
                  d={PIONEER_SPARKLE}
                  fill="black"
                  className="pioneer-sparkle-cutout"
                />
              </mask>
            </defs>
            <path d={PIONEER_P_BODY} fill={colors.body} mask="url(#pioneer-sparkle-mask)" />
          </>
        )}
      </svg>
    </span>
  );
}

function YieldLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 33.16 24.73"
        className="h-full w-auto max-w-full"
      >
        <path d={YIELD_PATH} fill="var(--color-foreground)" />
      </svg>
    </span>
  );
}

export default function ProjectLogo({ projectId, theme, className, alt }: ProjectLogoProps) {
  const reducedMotion = useReducedMotion();
  const externalLogo = getExternalLogo(projectId);
  const externalLogoSrc = getExternalLogoSrc(projectId, theme);

  // Preload the other themes' variants only when the visitor shows intent
  // to switch (hover/focus on the theme cycle button) — most sessions never
  // touch it, so eager preloading wasted six downloads per visit.
  useEffect(() => {
    if (!externalLogoSrc) return;

    const onIntent = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("[data-theme-cycle]")) {
        void preloadAlternateLogos(theme);
      }
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [externalLogoSrc, theme]);

  if (projectId === "atax") {
    return <AtaxLogo className={className} alt={alt} />;
  }

  if (projectId === "pioneerdev-ai") {
    const colors = PIONEER_THEME[theme];
    return (
      <PioneerLogo colors={colors} alt={alt} className={className} reducedMotion={reducedMotion} />
    );
  }

  if (projectId === "yield") {
    return <YieldLogo className={className} alt={alt} />;
  }

  if (externalLogoSrc) {
    return (
      <img
        src={externalLogoSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        width={externalLogo?.width}
        height={externalLogo?.height}
        data-project-logo={externalLogo?.file}
        className={clsx("block w-auto max-w-full", className)}
      />
    );
  }

  return (
    <span className={className} aria-hidden>
      {projectId}
    </span>
  );
}
