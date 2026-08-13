import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SPRING_CONFIG, CSS_TRANSITIONS } from "@/lib/config/animation";
import { TRACE_STEPS } from "@/lib/data/lab";

/**
 * The reasoning trace, collapsed to one line by default.
 *
 * Collapsed is the right resting state: the trace is evidence, not content.
 * A reader wants to know the work happened and how long it took; only a reader
 * who distrusts the answer opens it. So the summary line carries the total
 * time, and everything else waits behind one click.
 *
 * Steps are numbered in mono and hung off a hairline rail, which is how this
 * site already draws a sequence. Each step's own duration sits right-aligned
 * in tabular figures so the column stays straight as the numbers change.
 *
 * Layout animation, not a height transition — docs/animation.md forbids
 * animating height, and Motion's layout projection does it on transforms.
 */

const totalSeconds = (TRACE_STEPS.reduce((n, step) => n + step.ms, 0) / 1000).toFixed(1);

export default function ThinkingTrace({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div layout transition={SPRING_CONFIG.noBounce} className={`w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group text-foreground/60 hover:text-tertiary focus-visible:ring-accent flex w-full items-center gap-2 py-1 font-mono text-[0.6875rem] leading-4 tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        style={CSS_TRANSITIONS.border}
      >
        {/* A rule that extends into the row on hover — the site's "this opens"
            language without borrowing the corner brackets, which promise a
            modal (design-system.md §5). Scaled, not widened: animating width
            is out (docs/animation.md §2), and scaleX off the left edge lands
            on the compositor. */}
        <span
          className="bg-accent/40 group-hover:bg-tertiary h-px w-5 origin-left scale-x-60 transition-[transform,background-color] group-hover:scale-x-100"
          style={CSS_TRANSITIONS.border}
          aria-hidden="true"
        />
        <span>Thought for {totalSeconds}s</span>
        <span className="text-foreground/40" aria-hidden="true">
          {open ? "[ hide ]" : `[ ${TRACE_STEPS.length} steps ]`}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            key="steps"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_CONFIG.noBounce}
            className="border-accent/20 mt-3 ml-1 space-y-3 border-l border-dashed pl-4"
          >
            {TRACE_STEPS.map((step, i) => (
              <li key={step.label} className="flex items-baseline gap-3">
                <span className="text-foreground/40 font-mono text-[0.625rem] leading-4 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm">{step.label}</span>
                  <span className="text-foreground/60 block text-[0.8125rem] leading-6">
                    {step.detail}
                  </span>
                </span>
                <span className="text-foreground/40 shrink-0 font-mono text-[0.625rem] leading-4 tabular-nums">
                  {(step.ms / 1000).toFixed(2)}s
                </span>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
