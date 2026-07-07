import type { Award } from "@/lib/types";

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
