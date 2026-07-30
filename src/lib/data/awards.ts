import type { Award } from "@/lib/types";

// To add a logo: put the file next to this one (e.g. src/lib/data/logos/),
// `import logo from "./logos/foo.png"`, then set `imageUrl: logo` below.
// Astro resolves the import through astro:assets — optimized format, real
// width/height, no manual sizing needed.
export const awards: Award[] = [
  {
    id: "claude-open-source",
    title: "Claude for Open Source",
    issuer: "Anthropic",
    type: "Program",
    description:
      "Claude Max 20x, free for six months, for maintainers and contributors keeping the open-source ecosystem running. Accepted on vallow.nvim.",
    stats: [
      { key: "plan", value: "Max 20x" },
      { key: "term", value: "6 months" },
      { key: "year", value: "2026" },
    ],
    year: 2026,
  },
  {
    id: "dep-builder",
    title: "Data Engineering Foundations",
    issuer: "Data Engineering Pilipinas",
    type: "Cohort",
    description:
      "One of 50 Builders in the inaugural 2026 Open Track. Finishers ship a live pipeline, a documented repo and a public dashboard.",
    stats: [
      { key: "selected", value: "1/50" },
      { key: "track", value: "open" },
      { key: "year", value: "2026" },
    ],
    year: 2026,
  },
];
