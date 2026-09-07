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

// Geometry from the Chozi brand file. The source is a white house on the
// brand's own ground; here it rides the ink ladder like Vallow and Yield. The
// viewBox is cropped to the path's bounds so the mark fills its plate height.
const CHOZI_PATH =
  "M 513.82 174.334 C 513.976 174.328 514.132 174.319 514.288 174.317 C 527.551 174.14 542.327 179.638 553.914 185.892 C 570.114 194.635 584.592 207.533 599.377 218.468 C 620.363 233.99 640.797 249.768 661.251 265.968 C 669.957 272.864 679.059 279.418 687.411 286.731 C 698.156 296.139 709.192 305.247 719.865 314.719 C 726.406 320.523 733.174 328.557 740.757 332.825 C 741.671 333.34 741.257 333.308 742.317 332.894 C 748.367 330.531 769.451 309.353 775.855 303.877 C 808.905 275.618 905.854 195.742 942.063 186.216 C 949.606 184.231 957.069 184.313 963.919 188.402 C 973.795 194.297 977.054 204.988 979.656 215.441 C 977.367 221.913 973.445 230.734 967.894 234.877 C 955.207 244.372 940.947 251.789 927.863 260.738 C 893.049 284.548 859.196 309.935 827.043 337.243 C 813.273 348.938 799.356 363.553 784.184 373.385 C 792.331 383.528 802.663 394.168 811.552 403.754 C 878.507 475.953 924.528 582.454 787.686 606.302 C 789.629 625.232 789.016 646.155 789.009 665.4 L 789.065 749.231 C 789.091 782.639 786.094 808.165 761.569 832.974 C 728.352 866.574 682.569 859.958 639.547 859.949 L 518.5 859.941 L 396.067 859.961 C 354.235 859.973 310.719 866.203 277.847 834.587 C 265.761 822.782 257.119 807.909 252.847 791.563 C 248.045 772.661 249.52 734.337 249.522 713.669 C 249.7 678.631 249.599 643.592 249.22 608.555 C 125.71 598.091 139.88 499.465 201.529 423.997 C 214.44 408.192 226.57 390.828 241.141 375.95 C 231.821 369.215 222.492 360.615 213.545 353.232 C 170.131 317.349 125.532 282.698 78.562 251.563 C 69.809 245.761 56.849 237.003 50.977 228.57 C 33.288 203.171 61.768 175.743 87.952 188.145 C 107.518 197.412 123.231 211.545 140.919 223.768 C 171.125 244.901 200.234 267.598 229.135 290.469 C 239.029 298.264 272.012 328.944 281.011 334.008 L 281.841 334.464 C 288.407 329.475 309.59 308.391 317.978 300.89 C 356.359 266.062 397.096 233.924 439.901 204.705 C 470.551 184.057 477.509 178.846 513.82 174.334 z M 323.075 373.073 C 360.755 417.755 419.399 468.894 413.964 533.832 C 412.492 551.009 404.215 566.885 390.975 577.927 C 362.269 602.143 341.681 600.819 309.286 608.412 C 309.683 622.74 308.548 637.268 308.334 651.684 C 308.129 677.991 308.069 704.3 308.154 730.608 C 308.196 747.313 306.804 771.562 312.584 787.411 C 314.562 792.835 326.361 799.701 332.005 800.279 C 353.445 802.3 375.802 801.637 397.35 801.637 L 523.5 801.593 L 645.628 801.544 C 661.873 801.539 678.133 801.698 694.374 801.468 C 705.132 801.315 712.68 798.782 720.416 791.193 C 724.911 786.857 728.028 781.291 729.378 775.193 C 731.451 765.564 730.865 739.12 730.876 727.893 L 730.853 645.671 C 730.733 633.69 730.749 621.709 730.901 609.728 C 717.501 610.339 707.225 608.549 694.874 606.287 C 564.777 582.459 619.008 462.57 681.785 397.429 C 688.174 390.799 694.529 381.578 700.477 375.19 C 700.804 374.834 701.137 374.482 701.474 374.136 C 692.367 369.23 673.629 351.074 664.438 343.465 C 637.859 321.232 610.673 299.734 582.912 278.995 C 564.543 265.012 531.541 238.594 511.566 230.938 C 456.88 258.616 412.129 298.16 365.082 336.938 C 351.117 348.449 338.571 364.802 323.075 373.073 z M 752.992 551.986 C 772.656 549.854 809.894 549.032 818.92 528.473 C 810.271 483.936 772.441 447.661 742.903 415.712 C 718.883 446.382 675.169 489.76 673.429 531.323 C 672.529 552.826 738.626 552.213 752.992 551.986 z M 286.873 551.829 C 303.559 549.594 346.897 546.061 354.002 533.36 C 366.767 510.542 321.796 458.7 307.511 442.275 C 301.194 435.011 290.25 422.131 284.958 418.688 C 284.324 418.271 283.665 417.893 282.985 417.555 C 280.664 420.335 278.433 422.789 275.976 425.513 C 254.028 449.842 233.373 476.771 219.885 506.811 C 215.515 516.543 207.329 533.416 218.913 541.684 C 236.165 552.703 267.007 552.486 286.873 551.829 z";

function ChoziLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center select-none", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="40 172 944 692"
        className="h-full w-auto max-w-full"
      >
        <path d={CHOZI_PATH} fill="var(--logo-ink-100)" />
      </svg>
    </span>
  );
}

// Geometry from the Match Guarantee brand file. The source is a gold sheen —
// gold, pale gold, gold along one diagonal. The stops keep that shape but run
// ink → tertiary → ink, the way the slavicmeet file leans on Nightingale's
// gold. Pure secondary → tertiary was tried and read as a peach heart there.
const MATCHGUARANTEE_PATH =
  "M204.749,27.701l11.981-11.981c10.129-10.129,23.782-15.72,38.095-15.72s27.965,5.591,38.095,15.72c10.129,10.13,15.72,23.783,15.72,38.096s-5.59,27.965-15.719,38.095l-72.775,61.716c-4.466,3.754-9.928,5.634-15.396,5.656-5.468-.022-10.929-1.902-15.395-5.656l-72.775-61.716c-10.129-10.13-15.72-23.783-15.72-38.095s5.591-27.966,15.72-38.096C126.708,5.591,140.361,0,154.674,0s27.966,5.592,38.095,15.72l11.981,11.981h0ZM204.749,149.602c2.671-.077,5.331-.87,7.647-2.409.463-.307.911-.644,1.344-1.011l5.728-4.858c-6.07-4.398-10.354-8.37-14.719-13.184-4.365,4.814-8.648,8.786-14.719,13.184l5.728,4.858c.432.367.881.703,1.344,1.011,2.316,1.538,4.976,2.332,7.647,2.409h0ZM204.749,112.828c1.033-1.593,1.979-3.204,2.841-4.83,5.073-9.567,7.263-19.737,7.263-30.222,0-7.911-1.292-15.362-3.598-21.976-1.678-4.814-3.883-9.186-6.506-12.968-2.623,3.782-4.828,8.155-6.506,12.968-2.306,6.614-3.598,14.066-3.598,21.976,0,10.485,2.19,20.655,7.263,30.222.862,1.626,1.808,3.236,2.841,4.83h0ZM182.669,135.082c6.428-4.553,11.756-9.349,16.103-14.343-1.954-2.737-3.677-5.526-5.18-8.361-5.844-11.022-8.367-22.659-8.367-34.601,0-8.934,1.49-17.439,4.149-25.068,2.309-6.624,5.517-12.587,9.414-17.604l-12.703-12.702c-8.352-8.352-19.613-12.952-31.412-12.952s-23.06,4.6-31.413,12.952c-8.352,8.352-12.952,19.613-12.952,31.413s4.6,23.06,12.952,31.412c19.765,16.639,39.759,33.191,59.407,49.854h0ZM226.83,135.082c19.649-16.663,39.642-33.216,59.407-49.854,8.353-8.352,12.952-19.613,12.952-31.412s-4.6-23.06-12.952-31.413c-8.353-8.352-19.613-12.952-31.413-12.952s-23.06,4.6-31.412,12.952l-12.703,12.702c3.897,5.017,7.105,10.981,9.414,17.604,2.659,7.629,4.149,16.133,4.149,25.068,0,11.942-2.522,23.579-8.367,34.601-1.503,2.834-3.225,5.623-5.179,8.361,4.347,4.994,9.675,9.79,16.103,14.343Z";

function MatchGuaranteeLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={clsx("inline-flex items-center justify-center select-none", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="100.003 0 210.007 159.002"
        className="h-full w-auto max-w-full"
      >
        <defs>
          <linearGradient
            id="matchguarantee-sheen"
            x1="175.402"
            y1="91.553"
            x2="236.222"
            y2="13.345"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="var(--logo-ink-100)" />
            <stop offset="0.5" stopColor="var(--color-tertiary)" />
            <stop offset="1" stopColor="var(--logo-ink-100)" />
          </linearGradient>
        </defs>
        <path d={MATCHGUARANTEE_PATH} fill="url(#matchguarantee-sheen)" fillRule="evenodd" />
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

  if (projectId === "chozi") {
    return <ChoziLogo className={className} alt={alt} />;
  }

  if (projectId === "matchguarantee") {
    return <MatchGuaranteeLogo className={className} alt={alt} />;
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
