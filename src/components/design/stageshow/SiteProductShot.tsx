import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import CornerDiamond from "@/components/ui/CornerDiamond";
import XeinLogoServer from "@/components/hero/XeinLogoServer";
import { personalInfo } from "@/lib/data/personal";
import ClientStage from "./ClientStage";
import { Stage } from "./kit/stage";
import { Window, Bar, Text } from "./kit/window";
import { Roll } from "./kit/motion/Roll";
import { Popover } from "./kit/motion/Popover";
import { Menu } from "./kit/parts/Menu";
import type { Act } from "./kit/act";
import s from "./SiteProductShot.module.css";

/* Product shot: xeind.net's home page, framed the way a launch page frames a
   product. The cursor opens the theme picker and walks the four themes; the
   whole page repaints under it.

   The repaint costs no literal color. global.css writes each theme as a bare
   [data-theme="..."] block, so a div carrying that attribute re-resolves the
   site's own tokens for everything inside it. The div sits OUTSIDE the stage:
   look.css maps --ss-* to --color-* at .ss-stage, and a wrapper above it is
   what that mapping reads. The stage itself stays theme="light" (see
   look.css). The script sets the attribute through a ref, not state, so the
   repaint lands in the same frame as the click. */

type ThemeName = "light" | "dark" | "nightingale" | "blueprint";

const THEMES: { value: ThemeName; label: string }[] = [
  { value: "dark", label: "Manila" },
  { value: "light", label: "Kozo" },
  { value: "nightingale", label: "Nightingale" },
  { value: "blueprint", label: "Blueprint" },
];
const LABEL = Object.fromEntries(THEMES.map((t) => [t.value, t.label])) as Record<
  ThemeName,
  string
>;
const SCHEME = {
  light: "scheme-light",
  dark: "scheme-dark",
  nightingale: "scheme-nightingale",
  blueprint: "scheme-blueprint",
} as const;

type S = { theme: ThemeName; open: boolean };

/** The page's own theme: Kozo is the theme with no attribute. */
function pageTheme(): ThemeName {
  const attr = document.documentElement.getAttribute("data-theme");
  return THEMES.some((t) => t.value === attr) ? (attr as ThemeName) : "light";
}

/* The walk starts on the page's own theme and ends back on it, visiting the
   other three in the site's order. A wrapper can only paint a theme that
   global.css names by attribute; Kozo has none (it is :root), so a stage
   inside a Manila page cannot paint Kozo. Returning to whatever the page
   already is needs no such rule, and the reset is a seen pick. */
function walkFrom(base: ThemeName): ThemeName[] {
  return [...(["dark", "nightingale", "blueprint"] as const).filter((t) => t !== base), base];
}

function makeScript(walk: ThemeName[]) {
  return async function script(a: Act<S>) {
    await a.wait(700);
    for (const theme of walk) {
      await a.move({ at: "picker", x: 0.9, y: 0.5 });
      await a.wait(150);
      await a.click();
      await a.set({ open: true });
      await a.wait(350);
      await a.move({ at: `option-${theme}`, x: 0.9, y: 0.5 });
      await a.wait(150);
      await a.click();
      await a.set({ theme, open: false });
      await a.wait(theme === walk[walk.length - 2] ? 2200 : 1300);
    }
    await a.move("rest");
    await a.wait(300);
  };
}

/** Hands the theme to the wrapper before paint. */
function ThemeScope({
  theme,
  apply,
}: {
  theme: ThemeName;
  apply: (theme: ThemeName | null) => void;
}) {
  useLayoutEffect(() => {
    apply(theme);
    return () => apply(null);
  }, [theme, apply]);
  return null;
}

function Swatch({ theme }: { theme: ThemeName }) {
  return (
    <span className={`scheme-preview ${SCHEME[theme]}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function Cta({ className }: { className?: string }) {
  return (
    <div className={`${s.cta} ${className ?? ""}`}>
      <Bar w={72} h={7} tone={3} />
    </div>
  );
}

function Shot({ base, apply }: { base: ThemeName; apply: (theme: ThemeName | null) => void }) {
  const walk = walkFrom(base);
  const initial: S = { theme: base, open: false };
  const poster: S = { theme: walk[walk.length - 2], open: false };
  const script = useMemo(() => makeScript(walk), [base]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stage
      width={896}
      height={448}
      theme="light"
      compact={{ below: 560, width: 358, height: 316 }}
      initial={initial}
      poster={poster}
      script={script}
      cursor={{ at: { wide: { x: 780, y: 250 }, compact: { x: 290, y: 286 } } }}
      className={s.stage}
    >
      {(st, rect, layout) => (
        <>
          <ThemeScope theme={st.theme} apply={apply} />
          <Window url="xeind.net" lights="grey" className={s.window}>
            <div className={s.page}>
              <div className={s.rails}>
                <div className={s.callout}>
                  <Bar w={layout === "compact" ? 72 : 88} h={7} tone={3} />
                </div>
                <div className={s.hero}>
                  <div className={s.identity}>
                    <XeinLogoServer size={layout === "compact" ? 40 : 48} className={s.logo} />
                    <div className={s.name}>
                      <span className={s.nameText}>{personalInfo.name}</span>
                      <Bar w={64} h={6} tone={2} />
                    </div>
                    {layout === "wide" && (
                      <div className={s.socials}>
                        <Bar w={20} h={20} r={0} tone={3} />
                        <Bar w={20} h={20} r={0} tone={3} />
                        <Bar w={20} h={20} r={0} tone={3} />
                      </div>
                    )}
                  </div>
                  <Text wrap className={s.tagline}>
                    {personalInfo.tagline}
                  </Text>
                  {layout === "wide" && (
                    <div className={s.ctas}>
                      <Cta />
                      <Cta />
                    </div>
                  )}
                </div>
                <div className={s.band}>
                  <CornerDiamond position="tl" variant="frame" />
                  <CornerDiamond position="bl" variant="frame" />
                </div>
                <div className={s.about}>
                  <Text className={s.heading}>About</Text>
                  <div className={s.lines}>
                    <Bar w="92%" h={7} tone={2} />
                    <Bar w="78%" h={7} tone={2} />
                    <Bar w="64%" h={7} tone={2} />
                  </div>
                </div>
              </div>
            </div>
          </Window>

          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={s.trigger}
            data-target="picker"
            data-cursor="pointer"
            data-open={st.open || undefined}
          >
            <Swatch theme={st.theme} />
            <span className={s.label}>
              <Roll variant="fade">{LABEL[st.theme]}</Roll>
            </span>
          </button>

          <Popover
            show={st.open}
            origin="top left"
            className={s.popover}
            style={{
              left: rect("picker").x,
              top: rect("picker").y + rect("picker").height + 4,
              width: rect("picker").width,
            }}
          >
            <Menu
              className={s.menu}
              items={THEMES.map((t) => (
                <span
                  key={t.value}
                  className={s.option}
                  data-current={t.value === st.theme || undefined}
                >
                  <Swatch theme={t.value} />
                  {t.label}
                </span>
              ))}
              targets={THEMES.map((t) => `option-${t.value}`)}
            />
          </Popover>

          <span data-target="rest" className={s.rest} />
        </>
      )}
    </Stage>
  );
}

export default function SiteProductShot() {
  const scope = useRef<HTMLDivElement>(null);
  const [base] = useState(() => (typeof document === "undefined" ? "light" : pageTheme()));
  const apply = useCallback(
    (theme: ThemeName | null) => {
      const el = scope.current;
      if (!el) return;
      if (theme === null || theme === base) el.removeAttribute("data-theme");
      else el.setAttribute("data-theme", theme);
    },
    [base],
  );
  return (
    <div ref={scope} className={s.scope} data-ss-productshot="">
      <ClientStage width={896} height={448}>
        <Shot base={base} apply={apply} />
      </ClientStage>
    </div>
  );
}
