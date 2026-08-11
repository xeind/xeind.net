/**
 * The /lab scenario.
 *
 * Every specimen on that page shows the same fictional run: an agent asked to
 * make the awards grid respond to its container. One scenario across five
 * components, so the page reads as one interface caught at five moments
 * rather than a shelf of unrelated parts.
 *
 * The copy is deliberately specific to this repo. A demo that says "Lorem
 * ipsum" or "Task 1" proves the layout works and nothing else.
 */

export interface TraceStep {
  label: string;
  detail: string;
  ms: number;
}

export interface LabTask {
  name: string;
  meta: string;
  state: "running" | "done" | "failed";
}

export const TRACE_STEPS: TraceStep[] = [
  {
    label: "Read the brief",
    detail:
      "The grid breaks between 640px and 768px, where three columns are asked to hold a two-line title.",
    ms: 340,
  },
  {
    label: "Search the repo",
    detail: "AwardsGrid.tsx sets its columns from viewport breakpoints, not from its own width.",
    ms: 1180,
  },
  {
    label: "Check the system",
    detail:
      "ProjectGrid already uses @container for the plate tag, so the pattern exists and does not need inventing.",
    ms: 620,
  },
  {
    label: "Draft the change",
    detail: "Swap the sm: and md: prefixes for @sm and @md, and mark the wrapper as the container.",
    ms: 2090,
  },
];

export const STREAMED_ANSWER =
  "The grid is sized against the viewport, so a card in a narrow column still thinks it has a wide screen to work with. Moving it to a container query fixes it at the source and matches what ProjectGrid already does for its plate tag. One prefix swap, no new tokens, and the breakpoints stay where the reader expects them.";

export const APPROVAL = {
  action: "Edit AwardsGrid.tsx",
  summary:
    "Replace every viewport breakpoint prefix with its container equivalent, and mark the wrapper as the container.",
  diff: [
    { sign: "-", text: 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"' },
    { sign: "-", text: '<AwardCard award={award} className="p-4 sm:p-6" />' },
    { sign: "-", text: '<span className="hidden sm:inline">{award.year}</span>' },
    {
      sign: "+",
      text: 'className="@container grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-4"',
    },
    { sign: "+", text: '<AwardCard award={award} className="p-4 @sm:p-6" />' },
    { sign: "+", text: '<span className="hidden @sm:inline">{award.year}</span>' },
  ],
} as const;

export const TASKS: LabTask[] = [
  { name: "Rewrite AwardsGrid columns", meta: "1 file · 2 lines", state: "running" },
  { name: "Run the design checker", meta: "0 violations", state: "done" },
  { name: "Screenshot all three themes", meta: "Kozo render timed out", state: "failed" },
  { name: "Update the component notes", meta: "queued behind the rewrite", state: "done" },
];
