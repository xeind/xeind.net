import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { CSS_TRANSITIONS } from "@/lib/config/animation";
import { APPROVAL } from "@/lib/data/lab";

/**
 * Human-in-the-loop: the agent has written an edit and is holding it until
 * someone says yes.
 *
 * Two competing actions, and this system has one accent per theme, so they
 * cannot be told apart by color the way a green/grey button pair would be.
 * They are told apart by border instead: the primary action is solid, the
 * secondary dashed. That is the same dashed→solid grammar the whole site uses
 * for "resting" versus "engaged", so it needs no legend.
 *
 * The diff itself is not in here. It comes in as children from the Astro page,
 * rendered by blog/DiffBlock.astro — shiki only highlights at build time, so
 * the diff has to be server-rendered, and the blog needs the same component.
 * The card just holds it.
 */

type Decision = "pending" | "approved" | "declined";

const RESOLVED_COPY: Record<Exclude<Decision, "pending">, string> = {
  approved: "Applied to AwardsGrid.tsx",
  declined: "Left unchanged",
};

/**
 * The hover fill the hero CTAs and the callout band use: a flat tertiary wash,
 * scaled per theme by --surface-hover-fill. It brightens the surface. A
 * `hover:bg-muted` sat here first and darkened it instead, which reads as
 * disabled in Manila, where muted is below the card. Pressing takes the same
 * wash to full — the site answers a click with light, not with a scale, and a
 * button that shrinks under the cursor is a gesture from another design.
 */
function HoverFill() {
  return (
    <span
      aria-hidden
      className="bg-tertiary/10 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-(--surface-hover-fill) group-active:opacity-100"
      style={CSS_TRANSITIONS.border}
    />
  );
}

interface ApprovalCardProps {
  /** The diff, slotted in from Astro. See blog/DiffBlock.astro. */
  children?: React.ReactNode;
  className?: string;
}

export default function ApprovalCard({ children, className = "" }: ApprovalCardProps) {
  const [decision, setDecision] = useState<Decision>("pending");

  return (
    <div
      // -my-px: the card's two border hairlines overlap its neighbours'
      // pixels instead of adding height, so the panel below stays on the grid.
      className={`border-accent/30 bg-card relative -my-px border border-dashed p-4 sm:p-6 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant="accent">Needs approval</Badge>
        <span className="text-foreground font-mono text-[0.8125rem]">{APPROVAL.action}</span>
      </div>

      <p className="text-foreground/70 mb-4 text-sm leading-6">{APPROVAL.summary}</p>

      {/* The diff arrives as slotted children from the Astro page, rendered by
          blog/DiffBlock.astro. It is static and shiki only highlights at build
          time, so it stays server-rendered and never hydrates — the island
          wraps it without owning it. Same component the blog uses. */}
      <div className="mb-4">{children}</div>

      {/* One wrapper across both states, with the button row's height held by
          min-h. The resolved state is a line of text and would otherwise be
          ~12px shorter, so the card — and everything below it — jumped on
          click. An approval that moves the page as you answer it is the one
          thing this component must not do. */}
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        {decision === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => setDecision("approved")}
              className="border-accent text-accent hover:border-tertiary hover:text-tertiary focus-visible:ring-accent group relative border px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide transition-[border-color,color] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={CSS_TRANSITIONS.border}
            >
              <HoverFill />
              <span className="relative z-10">Approve</span>
            </button>
            <button
              type="button"
              onClick={() => setDecision("declined")}
              className="border-accent/30 text-foreground/60 hover:border-accent/50 hover:text-tertiary focus-visible:ring-accent group relative border border-dashed px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide transition-[border-color,color] hover:border-solid focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={CSS_TRANSITIONS.border}
            >
              <HoverFill />
              <span className="relative z-10">Decline</span>
            </button>
          </>
        ) : (
          <>
            <span
              role="status"
              className="text-foreground/60 font-mono text-[0.6875rem] tracking-wide"
            >
              {RESOLVED_COPY[decision]}
            </span>
            <button
              type="button"
              onClick={() => setDecision("pending")}
              className="text-foreground/40 hover:text-tertiary focus-visible:ring-accent font-mono text-[0.6875rem] underline decoration-dashed underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={CSS_TRANSITIONS.border}
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
