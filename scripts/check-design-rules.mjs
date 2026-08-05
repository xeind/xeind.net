/**
 * Design-rule checker — makes the closed sets in docs/design-system.md real.
 *
 *   npm run check:design            scan src/, exit 1 on non-allowlisted hits
 *   node scripts/check-design-rules.mjs --self-test   run embedded fixtures
 *   node scripts/check-design-rules.mjs --list-allowlisted
 *
 * Exceptions live in scripts/design-rules-allowlist.json as explicit entries
 * ({file, rule, match, reason}) — a self-documenting grandfather register, not
 * a baseline count, so removing an old violation can never mask a new one.
 * Zero dependencies on purpose.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const ALLOWLIST_PATH = join(ROOT, "scripts", "design-rules-allowlist.json");

const EXTENSIONS = new Set([".tsx", ".ts", ".astro", ".css", ".mdx"]);

// Files that ARE the source of truth for a rule are exempt from it.
const TIMING_SOURCES = new Set(["src/lib/config/animation.ts", "src/styles/global.css"]);
const COLOR_SOURCES = new Set(["src/styles/global.css"]);

// THE closed sets — this block is the owner (design-system.md §0). The doc's
// tables describe these values for humans; when they disagree, these win.
// Extending a set is a design decision: change it here, then update the doc's
// prose in the same commit.
const Z_CLASSES = new Set(["-z-10", "z-0", "z-10", "z-20", "z-30", "z-40", "z-50"]);
const TEXT_ARBITRARY = new Set(["text-[0.625rem]", "text-[0.6875rem]", "text-[0.8125rem]"]);
const GAPS = new Set([
  ...["0.75", "1", "1.5", "2", "3", "4", "5", "6", "8"].map((n) => `gap-${n}`),
  "gap-x-3",
  "gap-x-4",
  "gap-y-1",
  "gap-y-2",
]);
const STACKS = new Set(["1", "1.5", "2", "3", "4", "6", "8"].map((n) => `space-y-${n}`));
const RADII = new Set(["rounded-[1px]", "rounded-[2px]", "rounded-none"]);

// Strip responsive/state prefixes: md:gap-8 → gap-8, group-hover:z-10 → z-10.
const stripVariants = (cls) => cls.slice(cls.lastIndexOf(":") + 1);

const RULES = [
  {
    id: "raw-color",
    message: "literal color — use a token utility, color-mix(), or a variable in global.css",
    test(line, file) {
      if (COLOR_SOURCES.has(file)) return [];
      if (/^\s*(\/\/|\*|\/\*|\{?\s*\/\*)/.test(line)) return []; // comments
      const hits = [];
      // Hex colors — but not in an SVG <mask> block (handled by maskDepth) and
      // not stroke-dasharray-like attribute noise.
      for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (/(url\(|%23)/.test(line)) continue; // encoded data-URI SVG
        hits.push(m[0]);
      }
      for (const m of line.matchAll(/\b(?:rgb|hsl)a?\(/g)) {
        // Alpha-ramp exception: rgba(0,0,0,…) / rgb(0 0 0 / …) inside a mask
        // ramp or scrim is geometry, not color (design-system.md §3).
        const isBlackAlpha = /(?:rgb|rgba)\(\s*0[\s,]+0[\s,]+0/.test(line);
        if (isBlackAlpha && /mask|scrim|bg-black/i.test(line)) continue;
        hits.push(m[0]);
      }
      return hits;
    },
  },
  {
    id: "radius",
    message: "rounded corner — sharp corners only ([1px]/[2px] optical corrections excepted)",
    test(line) {
      const hits = [];
      // No trailing boundary assertion: `-[1px]` ends in `]`, which defeats
      // \b against a closing quote. Greedy alternation consumes the full
      // token, so a bare `rounded` match really is bare.
      for (const m of line.matchAll(/\brounded(?:-\[[^\]]+\]|-[a-z0-9]+)?/g)) {
        const cls = stripVariants(m[0]);
        if (cls === "rounded") {
          hits.push(cls);
          continue;
        }
        if (!RADII.has(cls)) hits.push(cls);
      }
      return hits;
    },
  },
  {
    id: "shadow",
    message: "shadow — depth comes from hairlines and corner marks",
    test(line, file) {
      if (file === "src/styles/global.css" && /--text-shadow/.test(line)) return [];
      const hits = [];
      for (const m of line.matchAll(/\b(?:drop-)?shadow-[a-z0-9[\]/]+/g)) hits.push(m[0]);
      if (/box-shadow\s*:/.test(line) && !/none/.test(line)) hits.push("box-shadow");
      return hits;
    },
  },
  {
    id: "dark-variant",
    message: "dark: fires on the OS setting, not data-theme — use a per-theme variable",
    test(line) {
      const hits = [];
      for (const m of line.matchAll(/[\s"'`{]dark:[a-z-]/g)) hits.push(m[0].trim());
      return hits;
    },
  },
  {
    id: "z-index",
    message: "off-ladder z-index — the ladder is -10 0 10 20 30 40 50 (css: 2, 9998, 9999)",
    test(line, file) {
      const hits = [];
      for (const m of line.matchAll(/(?:^|[\s"'`])(-?z-(?:\[[^\]]+\]|\d+))/g)) {
        const cls = stripVariants(m[1]);
        if (!Z_CLASSES.has(cls)) hits.push(cls);
      }
      if (file.endsWith(".css")) {
        for (const m of line.matchAll(/z-index:\s*(-?\d+)/g)) {
          if (!["-10", "0", "2", "10", "20", "30", "40", "50", "9998", "9999"].includes(m[1]))
            hits.push(`z-index: ${m[1]}`);
        }
      }
      return hits;
    },
  },
  {
    id: "text-size",
    message: "off-scale text size — the scale + three micro sizes in design-system.md §4",
    test(line) {
      const hits = [];
      for (const m of line.matchAll(/\btext-\[[^\]]+\]/g)) {
        const cls = stripVariants(m[0]);
        if (/text-\[#|text-\[var|text-\[color/.test(cls)) continue; // color, caught by raw-color
        if (!TEXT_ARBITRARY.has(cls)) hits.push(cls);
      }
      for (const m of line.matchAll(/\btext-(?:3|4|5|6|7|8|9)xl\b/g)) hits.push(m[0]);
      return hits;
    },
  },
  {
    id: "spacing",
    message: "off-ladder gap/stack — the legal sets in design-system.md §5",
    test(line) {
      const hits = [];
      for (const m of line.matchAll(/\b(?:gap(?:-[xy])?|space-[xy])-[0-9.]+\b/g)) {
        const cls = stripVariants(m[0]);
        if (cls.startsWith("space-x")) {
          hits.push(cls); // no space-x on the ladder at all
          continue;
        }
        if (cls.startsWith("gap") ? !GAPS.has(cls) : !STACKS.has(cls)) hits.push(cls);
      }
      return hits;
    },
  },
  {
    id: "timing",
    message: "hand-written timing — use CSS_TRANSITIONS / the house 0.2s ease-out-cubic",
    test(line, file) {
      if (TIMING_SOURCES.has(file)) return [];
      const hits = [];
      for (const m of line.matchAll(/\bduration-\d+\b/g)) hits.push(m[0]);
      for (const m of line.matchAll(/cubic-bezier\([^)]*\)/g)) {
        // The house curve written out (Astro pages can't always import) is
        // legal when it matches exactly, as is a value interpolated from the
        // config (`cubic-bezier(${EASING…})` — that IS the source of truth).
        if (m[0].replace(/\s/g, "") === "cubic-bezier(0.215,0.61,0.355,1)") continue;
        if (m[0].includes("${")) continue;
        hits.push(m[0]);
      }
      return hits;
    },
  },
];

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Content shape — enforces docs/content.md against src/lib/data/. Nothing on
// this site truncates, so length is layout: a long description inflates a
// whole card row; overlong bullets vanish below the modal's hidden-scrollbar
// fold; an empty description opens an empty modal.

const BANNED_VOICE = /\b(seamless(?:ly)?|robust|cutting[- ]edge|leverag\w*|passionate)\b/i;

function parseEntries(source) {
  // Top-level array entries only: split on brace depth, remember start lines.
  const entries = [];
  let depth = 0;
  let current = null;
  source.split("\n").forEach((line, i) => {
    for (const ch of line) {
      if (ch === "{") {
        depth += 1;
        if (depth === 1 && !current) current = { line: i + 1, text: "" };
      } else if (ch === "}") {
        depth -= 1;
        if (depth === 0 && current) {
          entries.push(current);
          current = null;
        }
      }
    }
    if (current) current.text += line + "\n";
  });
  return entries;
}

const field = (text, name) => text.match(new RegExp(`${name}:\\s*"([^"]*)"`))?.[1];
const bullets = (text) => {
  const seg = text.match(/longDescription:\s*\[([\s\S]*?)\]/)?.[1];
  return seg ? [...seg.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
};

function checkProjects(push) {
  const pFile = "src/lib/data/projects.ts";
  for (const e of parseEntries(readFileSync(join(ROOT, pFile), "utf8"))) {
    const id = field(e.text, "id");
    if (!id) continue; // brace noise (imports, type annotations), not a data entry
    const title = field(e.text, "title") ?? "";
    const desc = field(e.text, "description");
    const pts = bullets(e.text);
    const interactive = !/interactive:\s*false/.test(e.text);

    if (title.length > 16) push(pFile, e.line, id, `title ${title.length} chars (max 16)`);
    if (desc !== undefined && desc.length > 50)
      push(pFile, e.line, id, `description ${desc.length} chars (max 50)`);
    if (interactive && !(desc?.trim() || pts.length))
      push(
        pFile,
        e.line,
        id,
        "opens an empty modal: no description, no bullets, not interactive:false",
      );
    if (pts.length > 3) push(pFile, e.line, id, `${pts.length} bullets (max 3)`);
    for (const b of pts)
      if (b.length > 160) push(pFile, e.line, id, `bullet ${b.length} chars (max 160)`);
    const total = pts.reduce((n, b) => n + b.length, 0);
    if (total > 550)
      push(pFile, e.line, id, `bullets total ${total} chars — below the modal fold past ~550`);
    for (const s of [desc ?? "", ...pts]) {
      const bad = s.match(BANNED_VOICE);
      if (bad) push(pFile, e.line, id, `marketing register: "${bad[0]}"`);
    }
  }
}

function checkAwards(push) {
  const aFile = "src/lib/data/awards.ts";
  for (const e of parseEntries(readFileSync(join(ROOT, aFile), "utf8"))) {
    const id = field(e.text, "id");
    if (!id) continue;
    const title = field(e.text, "title") ?? "";
    const issuer = field(e.text, "issuer") ?? "";
    const desc = field(e.text, "description") ?? "";
    if (title.length > 32) push(aFile, e.line, id, `title ${title.length} chars (max 32)`);
    if (issuer.length > 28) push(aFile, e.line, id, `issuer ${issuer.length} chars (max 28)`);
    if (desc.length < 120 || desc.length > 170)
      push(
        aFile,
        e.line,
        id,
        `description ${desc.length} chars (band 120–170 so the row reads as a set)`,
      );
    const bad = desc.match(BANNED_VOICE);
    if (bad) push(aFile, e.line, id, `marketing register: "${bad[0]}"`);
  }
}

function checkContent() {
  const out = [];
  const push = (file, line, match, message) =>
    out.push({ file, line, rule: "content", match, message });
  checkProjects(push);
  checkAwards(push);
  return out;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(name.slice(name.lastIndexOf(".")))) yield path;
  }
}

function loadAllowlist() {
  try {
    return JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch {
    return [];
  }
}

function isAllowed(allowlist, file, rule, match) {
  return allowlist.some(
    (e) => e.file === file && e.rule === rule && (e.match === "*" || match.includes(e.match)),
  );
}

function scan() {
  const allowlist = loadAllowlist();
  const violations = [];
  const allowed = [];

  for (const path of walk(SRC)) {
    const file = relative(ROOT, path);
    const lines = readFileSync(path, "utf8").split("\n");
    let inSvgMask = 0;

    lines.forEach((line, i) => {
      // Track SVG <mask> blocks: literal fills inside are alpha, not color.
      inSvgMask += (line.match(/<mask\b/g) || []).length;
      const isMasked = inSvgMask > 0;
      inSvgMask -= (line.match(/<\/mask>/g) || []).length;

      for (const rule of RULES) {
        for (const match of rule.test(line, file)) {
          if (rule.id === "raw-color" && isMasked) continue;
          const entry = { file, line: i + 1, rule: rule.id, match, message: rule.message };
          if (isAllowed(allowlist, file, rule.id, match)) allowed.push(entry);
          else violations.push(entry);
        }
      }
    });
  }

  for (const entry of checkContent()) {
    if (isAllowed(allowlist, entry.file, entry.rule, entry.match)) allowed.push(entry);
    else violations.push(entry);
  }

  return { violations, allowed, allowlist };
}

// ---------------------------------------------------------------------------

const FIXTURES = [
  // [rule, line, file, shouldFlag]
  ["raw-color", 'className="text-[#EBE5D8]"', "src/x.tsx", true],
  ["raw-color", "color: hsl(42 29% 92%);", "src/x.css", true],
  ["raw-color", "color: hsl(42 29% 92%);", "src/styles/global.css", false],
  ["raw-color", 'style="mask-image:linear-gradient(rgba(0,0,0,0.6))"', "src/x.astro", false],
  ["radius", 'className="rounded-md"', "src/x.tsx", true],
  ["radius", 'className="rounded-[1px]"', "src/x.tsx", false],
  ["shadow", 'className="shadow-lg"', "src/x.tsx", true],
  ["dark-variant", 'className="dark:opacity-50"', "src/x.tsx", true],
  ["z-index", 'className="z-[60]"', "src/x.tsx", true],
  ["z-index", 'className="z-20"', "src/x.tsx", false],
  ["text-size", 'className="text-[0.9rem]"', "src/x.tsx", true],
  ["text-size", 'className="text-6xl"', "src/x.tsx", true],
  ["text-size", 'className="text-[0.6875rem]"', "src/x.tsx", false],
  ["spacing", 'className="gap-7"', "src/x.tsx", true],
  ["spacing", 'className="md:gap-8"', "src/x.tsx", false],
  ["spacing", 'className="space-y-12"', "src/x.tsx", true],
  ["timing", 'className="duration-300"', "src/x.tsx", true],
  ["timing", "transition: all 180ms cubic-bezier(0.2, 0, 0, 1);", "src/x.astro", true],
  ["timing", "cubic-bezier(0.215, 0.61, 0.355, 1)", "src/x.astro", false],
];

function selfTest() {
  let failed = 0;
  for (const [ruleId, line, file, shouldFlag] of FIXTURES) {
    const rule = RULES.find((r) => r.id === ruleId);
    const flagged = rule.test(line, file).length > 0;
    if (flagged !== shouldFlag) {
      failed += 1;
      console.error(`  ✗ ${ruleId}: expected ${shouldFlag}, got ${flagged} — ${line}`);
    }
  }
  console.log(failed === 0 ? `self-test: ${FIXTURES.length} fixtures pass` : `${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.includes("--self-test")) selfTest();

const { violations, allowed } = scan();

if (args.includes("--list-allowlisted")) {
  for (const v of allowed) console.log(`  ${v.file}:${v.line}  [${v.rule}]  ${v.match}`);
  console.log(`${allowed.length} allowlisted match(es)`);
  process.exit(0);
}

if (violations.length > 0) {
  const byRule = Object.groupBy(violations, (v) => v.rule);
  for (const [rule, entries] of Object.entries(byRule)) {
    if (rule === "content") {
      console.error(`\ncontent — docs/content.md limits`);
      for (const v of entries) console.error(`  ${v.file}:${v.line}  [${v.match}] ${v.message}`);
    } else {
      console.error(`\n${rule} — ${entries[0].message}`);
      for (const v of entries) console.error(`  ${v.file}:${v.line}  ${v.match}`);
    }
  }
  console.error(
    `\n✗ ${violations.length} violation(s). Ratified exception? Add it to ` +
      `scripts/design-rules-allowlist.json with a reason — and to the doc's closed set.`,
  );
  process.exit(1);
}

console.log(`✓ design rules clean (${allowed.length} allowlisted)`);
