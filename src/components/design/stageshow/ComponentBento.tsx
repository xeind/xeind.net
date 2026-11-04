import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ClientStage from "./ClientStage";
import { Stage } from "./kit/stage";
import type { Act } from "./kit/act";
import { Count } from "./kit/motion/Count";
import Badge from "@/components/ui/Badge";
import CornerDiamond from "@/components/ui/CornerDiamond";
import { DashedBorders, CornerBrackets, GradientBackground } from "@/components/ui/frame";
import { awards } from "@/lib/data/awards";
import { personalInfo } from "@/lib/data/personal";
import { projects } from "@/lib/data/projects";
import s from "./ComponentBento.module.css";

/* The site's own parts as one ruled bento (references/bento.md). Closest gold:
   examples/ruled-bento, in the site's hairline look: shared 1px rules, no
   gaps, no rounding, a diamond on each outer corner.

   Tile list, written before any tile was built. At 896 the columns are
   300 / 292 / 300 and every tile is 288 tall: 96 of page copy, then a 192
   picture, its own Stage at 1:1, pinned to the tile bottom.

     Tile     Span  Kind       The one thing                          Moves
     Cards    2x1   Hero UI    two project cards, Vallow hovered      the cursor arrives, border firms, brackets light
     Themes   1x1   Collection Kozo, Manila, Nightingale, Blueprint    nine-cell palettes fill in
     Corners  1x1   Object     a Panel with its diamonds              the rule draws, the marks pop
     Count    1x1   Stat       "9" on the one muted tile              counts up, nine cells fill
     Tags     1x1   Component  the Badge, 1.5x, six real stacks       they rise in, Astro turns accent
     Awards   2x1   Component  the awards ledger, key and value stats rows rise in
     Voices   1x1   Statement  serif, sans, mono, one line each       rows write in

   Three of seven are UI (Cards, Tags, Awards), no window chrome anywhere, and
   no neighbour repeats a kind. No string repeats across tiles except what the
   data repeats between two cards.

   The Cards tile reuses the real DashedBorders, CornerBrackets and
   GradientBackground. Their hover is CSS :hover, which a script cannot drive,
   so the module restates the hover look under [data-hover] (set by the kit's
   cursor); a real mouse still works through the `group` class.

   Display size: the Count number is 48px, the bento floor. The site's type set
   has no display size, so that one value is an owner decision (see the report). */

const STEP = 110;
const LEAD = 450;
const PIC_H = 192;

type Beat = { on: boolean; then?: boolean };
const before: Beat = { on: false, then: false };
const after: Beat = { on: true, then: true };

const beat = (i: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD + i * STEP);
  await a.set({ on: true });
};

const vars = (o: Record<string, number | string>) => o as CSSProperties;

/* Measure the picture slot, so a Stage always draws at its native width. */
function Picture({ children }: { children: (width: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(Math.round(node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={s.picture}>
      {width > 0 ? children(width) : null}
    </div>
  );
}

interface TileProps {
  area: string;
  lead: string;
  copy: string;
  tone?: "muted";
  children: (width: number) => ReactNode;
}

function Tile({ area, lead, copy, tone, children }: TileProps) {
  return (
    <section className={`${s.tile} ${s[area]}`} data-tone={tone}>
      <p className={s.copy}>
        <span className={s.lead}>{lead}</span> {copy}
      </p>
      <div className={s.slot}>
        <ClientStage width={300} height={PIC_H}>
          <Picture>{children}</Picture>
        </ClientStage>
      </div>
    </section>
  );
}

/* ---------------- Cards (hero) ---------------- */

const card = projects[0];
const cardHost = card.liveUrl ? card.liveUrl.replace(/^https?:\/\//, "") : "";

const cardsScript = async (a: Act<Beat>) => {
  await a.wait(LEAD);
  await a.move({ at: "card-0", x: 0.5, y: 0.5 }, { duration: 900 });
};

// One wide card, running 40px off the tile's right edge: a UI fragment with no
// chrome, bleeding on the side it does not keep a gutter.
function Cards({ width }: { width: number }) {
  const narrow = width < 480;
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={cardsScript}
      hover={["card-0"]}
      cursor={{ at: { x: width - 56, y: 150 } }}
    >
      {() => (
        <div className={s.cards}>
          <div
            className={`group ${s.card}`}
            style={{ width: width - 24 + 40 }}
            data-target="card-0"
          >
            <DashedBorders />
            <CornerBrackets />
            <GradientBackground flash={false} />
            <p className={s.cardMeta}>
              {card.type} · {card.year}
            </p>
            <h3 className={s.cardTitle}>{card.title}</h3>
            <p className={s.cardDesc}>{card.description}</p>
            <div className={s.cardTags}>
              {card.technologies.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            {!narrow && (
              <p className={s.cardOpens}>
                <span className={s.cardOpensLabel}>Opens</span>
                {cardHost}
              </p>
            )}
          </div>
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Themes (collection) ---------------- */

const THEMES = [
  { name: "Kozo", className: s.kozo },
  { name: "Manila", className: s.manila },
  { name: "Nightingale", className: s.nightingale },
  { name: "Blueprint", className: s.blueprint },
];

function Themes({ width }: { width: number }) {
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={beat(1)}
    >
      {(st) => (
        <div className={s.chips} data-on={st.on || undefined}>
          {THEMES.map((t, ti) => (
            <div key={t.name} className={`${s.chip} ${t.className}`}>
              <span className={s.chipName}>{t.name}</span>
              <span className={s.cells}>
                {Array.from({ length: 9 }, (_, ci) => (
                  <span key={ci} className={s.cell} style={vars({ "--i": ti * 9 + ci })} />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Corners (object) ---------------- */

function Corners({ width }: { width: number }) {
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={beat(2)}
    >
      {(st) => (
        <div className={s.panel} data-on={st.on || undefined}>
          <span className={s.panelLabel}>Panel</span>
          <span className={s.divider} />
          <CornerDiamond variant="frame" position="all" style={vars({ "--d": 0 })} />
          <CornerDiamond
            variant="accent"
            position="tl"

            style={vars({ "--d": 520, top: "calc(50% - 3.5px)" })}
          />
          <CornerDiamond
            variant="accent"
            position="tr"

            style={vars({ "--d": 620, top: "calc(50% - 3.5px)" })}
          />
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Count (stat) ---------------- */

const projectCount = projects.length;
const since = Math.min(...projects.map((p) => p.year ?? Infinity));
const tallyColumns = Math.ceil(Math.sqrt(projectCount));

function Tally({ width }: { width: number }) {
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={beat(3)}
    >
      {(st) => (
        <div className={s.stat} data-on={st.on || undefined}>
          <span className={s.statNumber}>
            <Count value={st.on ? projectCount : 0} duration={900} />
          </span>
          <span className={s.tally} style={vars({ "--cols": tallyColumns })}>
            {projects.map((p, i) => (
              <span key={p.id} className={s.tallyCell} style={vars({ "--i": i })}>
                {p.title.charAt(0)}
              </span>
            ))}
          </span>
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Tags (component) ---------------- */

// Technologies from the cards the hero does not show
const TAGS = [
  { name: "Astro", variant: "default" as const },
  { name: "TypeScript", variant: "default" as const },
  { name: "Next.js", variant: "default" as const },
  { name: "React", variant: "default" as const },
  { name: "Cloudflare", variant: "muted" as const },
  { name: "Tailwind", variant: "muted" as const },
];

const tagsScript = async (a: Act<Beat>) => {
  await a.wait(LEAD + 4 * STEP);
  await a.set({ on: true });
  await a.wait(900);
  await a.set({ then: true });
};

function Tags({ width }: { width: number }) {
  const scale = width >= 296 ? 1.5 : 1.25;
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={tagsScript}
    >
      {(st) => (
        <div
          className={s.tags}
          data-on={st.on || undefined}
          style={vars({ "--scale": scale, width: (width - 48) / scale })}
        >
          {TAGS.map((t, i) => (
            <span key={t.name} className={s.tag} style={vars({ "--i": i })}>
              <Badge variant={i === 0 && st.then ? "accent" : t.variant}>{t.name}</Badge>
            </span>
          ))}
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Awards (component) ---------------- */

const ledger = awards.slice(0, 3);

function Awards({ width }: { width: number }) {
  const narrow = width < 480;
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={beat(5)}
    >
      {(st) => (
        <div className={s.ledger} data-on={st.on || undefined}>
          {ledger.map((a, i) => (
            <div key={a.id} className={s.award} style={vars({ "--i": i })}>
              <span className={s.awardHead}>
                <span className={s.awardTitle}>{a.title}</span>
                <span className={s.awardIssuer}>{a.issuer}</span>
              </span>
              {!narrow && a.stats && (
                <span className={s.awardStats}>
                  {a.stats.slice(0, 2).map((stat) => (
                    <span key={stat.key} className={s.awardStat}>
                      <span className={s.awardKey}>{stat.key}</span> {stat.value}
                    </span>
                  ))}
                </span>
              )}
              <span className={s.awardDate}>{a.date}</span>
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
}

/* ---------------- Voices (statement) ---------------- */

function Voices({ width }: { width: number }) {
  return (
    <Stage<Beat>
      width={width}
      height={PIC_H}
      theme="light"
      initial={before}
      poster={after}
      play="once"
      script={beat(6)}
    >
      {(st) => (
        <div className={s.voices} data-on={st.on || undefined}>
          <div className={s.voice} style={vars({ "--i": 0 })}>
            <span className={s.voiceTag}>Serif</span>
            <span className={s.voiceSerif}>{personalInfo.name}</span>
          </div>
          <div className={s.voice} style={vars({ "--i": 1 })}>
            <span className={s.voiceTag}>Sans</span>
            <span className={s.voiceSans}>{personalInfo.tagline}</span>
          </div>
          <div className={s.voice} style={vars({ "--i": 2 })}>
            <span className={s.voiceTag}>Mono</span>
            <span className={s.voiceMono}>{personalInfo.location}</span>
          </div>
        </div>
      )}
    </Stage>
  );
}

/* ---------------- The grid ---------------- */

export default function ComponentBento() {
  return (
    <div className={s.bento} data-ss-bento="">
      <div className={s.grid}>
        <Tile
          area="areaCards"
          lead="Project cards."
          copy="Brackets promise a modal; the border firms up under the cursor."
        >
          {(w) => <Cards width={w} />}
        </Tile>
        <Tile area="areaThemes" lead="Four themes." copy="One ink, repainted.">
          {(w) => <Themes width={w} />}
        </Tile>
        <Tile area="areaCorners" lead="Corner marks." copy="A diamond sits where two rules cross.">
          {(w) => <Corners width={w} />}
        </Tile>
        <Tile area="areaCount" lead="Projects" copy={`on the shelf since ${since}.`} tone="muted">
          {(w) => <Tally width={w} />}
        </Tile>
        <Tile area="areaTags" lead="Tags." copy="Mono type in a dashed box.">
          {(w) => <Tags width={w} />}
        </Tile>
        <Tile
          area="areaAwards"
          lead="Awards."
          copy="A title, an issuer, and stats as mono key and value."
        >
          {(w) => <Awards width={w} />}
        </Tile>
        <Tile
          area="areaVoices"
          lead="Three voices."
          copy="Serif reads, sans operates, mono measures."
        >
          {(w) => <Voices width={w} />}
        </Tile>
        <div className={s.frameMarks} aria-hidden>
          <CornerDiamond variant="frame" position="all" />
        </div>
      </div>
    </div>
  );
}
