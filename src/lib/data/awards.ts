import type { Award } from "@/lib/types";

// To add a logo: put the file next to this one (e.g. src/lib/data/logos/),
// `import logo from "./logos/foo.png"`, then set `imageUrl: logo` below.
// Astro resolves the import through astro:assets — optimized format, real
// width/height, no manual sizing needed.
export const awards: Award[] = [
  {
    id: "dep-builder",
    title: "Data Engineering Foundations",
    issuer: "Data Engineering Pilipinas",
    type: "Cohort",
    description:
      "Selected as 1 of 50 Builders for the inaugural 6-month, build-first data engineering cohort.",
    stats: [
      { key: "selected", value: "1/50" },
      { key: "track", value: "open" },
      { key: "year", value: "2026" },
    ],
    year: 2026,
  },
];
