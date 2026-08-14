import PixelGrid, { metrics } from "./PixelGrid";
import { TASKS, type LabTask } from "@/lib/data/lab";

/**
 * A queue of agent tasks, each showing its state.
 *
 * The hard part, and the reason this specimen exists: status without status
 * colors. A dashboard normally spends green/amber/red here. The diff in
 * ApprovalCard can borrow the syntax palette because added and removed are a
 * matched pair every reader knows; running, done and failed are three states
 * with no such pair behind them, and inventing a third hue would mean adding
 * one to the themes.
 *
 * So state is carried three ways that survive every theme:
 *   · the marker — running animates, done is filled, failed is hollow
 *   · the rail   — dashed while unsettled, solid once the row is finished
 *   · the word   — spelled out in mono, which is also what a screen reader gets
 *
 * The word is doing the real work. The marker and rail let you scan the column
 * without reading it. That ordering is deliberate: anything carried by shape
 * alone is a legend the reader has to learn.
 */

const MARKER = metrics(3).extent;

function Marker({ state }: { state: LabTask["state"] }) {
  if (state === "running") return <PixelGrid />;

  // Taken from the grid rather than typed, so the three states share one
  // optical column and the labels beside them stay aligned however the loader
  // is sized.
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: MARKER, height: MARKER }}
      aria-hidden="true"
    >
      <span className={`size-2 ${state === "done" ? "bg-accent" : "border-accent/60 border"}`} />
    </span>
  );
}

const STATE_LABEL: Record<LabTask["state"], string> = {
  running: "running",
  done: "done",
  failed: "failed",
};

export default function TaskRows({ className = "" }: { className?: string }) {
  return (
    <ul className={`w-full ${className}`}>
      {TASKS.map((task) => (
        <li
          key={task.name}
          className={`border-accent/25 flex items-center gap-3 border-b py-3 last:border-b-0 ${
            task.state === "running" ? "border-dashed" : ""
          }`}
        >
          <Marker state={task.state} />

          <span className="min-w-0 flex-1">
            <span
              className={`block text-sm ${
                task.state === "failed" ? "text-foreground/60" : "text-foreground"
              }`}
            >
              {task.name}
            </span>
            <span className="text-foreground/45 block font-mono text-[0.625rem] leading-4">
              {task.meta}
            </span>
          </span>

          <span className="text-foreground/50 shrink-0 font-mono text-[0.625rem] leading-4 tracking-wide">
            {STATE_LABEL[task.state]}
          </span>
        </li>
      ))}
    </ul>
  );
}
