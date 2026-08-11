import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { PROJECT_LOGO_URLS } from "@/lib/data/project-logo-urls";

type ResolvedTheme = "light" | "dark" | "nightingale" | "blueprint";

declare global {
  interface Window {
    __projectLogoPreload?: Promise<void>;
  }
}

const THEMES: readonly ResolvedTheme[] = ["light", "dark", "nightingale", "blueprint"];
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
// Tile depth comes from the shared logo ladder, not from opacity: each tile
// names a solid tone that already accounts for the tile background, so these
// match the hexes baked into the file-based logos exactly.
const ATAX_TILE_TONE = [
  "55",
  "75",
  "75",
  "75",
  "55",
  "55",
  "35",
  "35",
  "35",
  "55",
  "55",
  "55",
  "100",
  "55",
  "55",
  "55",
  "35",
  "35",
  "35",
  "55",
  "75",
  "35",
  "35",
  "35",
  "75",
] as const;
const DEFAULT_ATAX_PRIMARY_ORDER = Array.from({ length: ATAX_COORDS.length }, (_, i) => i);
const DEFAULT_ATAX_SECONDARY_ORDER = [0, 4, 6, 8, 12, 16, 18, 20, 24];
let lastAtaxFrame = {
  primaryOrder: DEFAULT_ATAX_PRIMARY_ORDER,
  secondaryOrder: DEFAULT_ATAX_SECONDARY_ORDER,
};

// ATAX colors resolve via --logo-* CSS variables (global.css) so the SVG
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
      className={clsx("inline-flex items-center justify-center select-none", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 54 48"
        className="h-full w-auto max-w-full"
      >
        <g>
          {ATAX_TILE_TONE.map((tone, i) => {
            const coord = ATAX_COORDS[primaryOrder[i]];
            return (
              <rect
                key={`a-${i}`}
                x={coord.x}
                y={coord.y}
                width="8"
                height="8"
                fill={`var(--logo-ink-${tone})`}
              />
            );
          })}
        </g>
        {/* The second layer shuffles on its own cadence, which is what makes the
            grid shimmer. It used the accent, which in Nightingale is a gold and
            read as brown boxes among cream ones; on the ink ladder's top tone it
            still separates from the layer beneath without a second hue. */}
        <g fill="var(--logo-ink-100)">
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
  light: { body: "var(--logo-ink-100)" },
  dark: { body: "var(--logo-ink-100)" },
  nightingale: { body: "var(--logo-ink-100)" },
  blueprint: { body: "var(--logo-ink-100)" },
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
      className={clsx("inline-flex items-center justify-center select-none", className)}
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

// Geometry from public/projects/fallow.svg; the baked hex there is for the
// repo's own README, while here the mark rides the ink ladder like the rest.
const VALLOW_PATH =
  "M56.195.128c-.264.064-.947.187-1.515.264q-1.031.142-13.245.18c-10.86.039-12.285.052-12.858.148-3.422.554-6.291,1.818-8.662,3.822-.664.561-1.727,1.631-2.237,2.249-1.192,1.463-2.307,3.558-2.894,5.446-.496,1.618-.541,2.114-.548,6.026-.006,1.843-.006,3.377,0,3.416.006.032.09-.2.187-.516.232-.767.722-1.979,1.102-2.739,1.611-3.216,3.88-5.543,6.864-7.045,1.805-.909,3.261-1.36,5.607-1.727.303-.052,3.371-.09,9.313-.122,7.928-.039,8.92-.058,9.41-.155,1.405-.277,2.269-.554,3.319-1.076,2.423-1.199,3.899-2.913,6.129-7.09.335-.625.606-1.154.606-1.179,0-.052.006-.052-.58.097ZM46.514,13.437c-1.476.29-1.818.303-10.332.348-7.058.039-8.198.058-8.733.148-1.998.342-3.435.793-5.06,1.592-3.049,1.489-5.401,3.809-6.832,6.735-.645,1.315-1.096,2.752-1.25,3.996-.077.599-.135,7.96-.064,7.96.019,0,.084-.18.148-.406.058-.219.271-.806.471-1.302,1.289-3.255,3.255-5.827,5.685-7.431,1.392-.922,2.688-1.495,4.293-1.914,1.65-.432,1.682-.432,7.187-.483,4.757-.039,5.027-.045,5.711-.18,3.345-.651,5.62-2.269,7.515-5.343.574-.922,1.985-3.629,1.985-3.796,0-.045-.277-.013-.722.077ZM26.256,27.031c-2.159.29-3.945.967-5.897,2.256-3.468,2.295-5.885,6.432-6.155,10.564l-.052.703.993-.039c2.23-.097,4.022-.535,5.891-1.463,1.553-.767,2.585-1.528,3.867-2.842,1.586-1.631,2.771-3.526,3.725-5.955.296-.748.806-2.404.973-3.145l.039-.174-1.366.006c-.754.006-1.663.045-2.017.09ZM12.346,40.373l1.355.179-.016-.178c-.072-.756-.368-2.464-.567-3.243-.639-2.531-1.575-4.561-2.941-6.379-1.106-1.467-2.033-2.352-3.476-3.309-1.737-1.157-3.458-1.819-5.658-2.197l-.98-.164-.038.703c-.254,4.132,1.619,8.543,4.768,11.258,1.774,1.526,3.459,2.423,5.564,2.984.346.09,1.243.243,1.99.345Z";

function VallowLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center select-none", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56.775 40.553"
        className="h-full w-auto max-w-full"
      >
        <path d={VALLOW_PATH} fill="var(--logo-ink-100)" />
      </svg>
    </span>
  );
}

function YieldLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center select-none", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 33.16 24.73"
        className="h-full w-auto max-w-full"
      >
        <path d={YIELD_PATH} fill="var(--logo-ink-100)" />
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

  if (projectId === "vallow") {
    return <VallowLogo className={className} alt={alt} />;
  }

  if (projectId === "yield") {
    return <YieldLogo className={className} alt={alt} />;
  }

  if (externalLogoSrc) {
    return (
      /* select-none matches the inline-SVG marks above. An <img> is inline
         replaced content, so a drag-selection across the card paints a
         highlight box over it; the SVG marks never did, which left half the
         grid highlightable and half not. */
      <img
        src={externalLogoSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        width={externalLogo?.width}
        height={externalLogo?.height}
        data-project-logo={externalLogo?.file}
        className={clsx("block w-auto max-w-full select-none", className)}
      />
    );
  }

  return (
    <span className={clsx("select-none", className)} aria-hidden>
      {projectId}
    </span>
  );
}
