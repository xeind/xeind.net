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
    url: "https://claude.com/contact-sales/claude-for-oss",
  },
  {
    id: "dep-builder",
    title: "DEP Engineering Program",
    issuer: "Data Engineering Pilipinas",
    type: "Cohort",
    description:
      "A six-month build sprint where selected builders ship a public GitHub project, a real data pipeline, and a deployable dashboard.",
    stats: [
      { key: "selected", value: "1/50" },
      { key: "track", value: "open" },
      { key: "year", value: "2026" },
    ],
    year: 2026,
    url: "https://dataengineeringpilipinas.github.io/dep-data-engineering-open-track/",
  },
];
