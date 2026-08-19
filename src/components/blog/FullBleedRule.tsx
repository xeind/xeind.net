import CornerDiamond from "@/components/ui/CornerDiamond";

interface FullBleedRuleProps {
  // The caller owns the flow. The rule itself is a 1px box with no margin of
  // its own, so the two sites that use it can spend their gap differently:
  // an MDX <hr> collapses against the block above it, the post header does
  // not.
  className?: string;
}

/**
 * A dashed hairline across the whole sheet, with a frame mark where it meets
 * each rail. The negative margins cancel the Panel's padding exactly, so the
 * box's edges are the sheet's edges and the two diamonds land on the rails.
 *
 * Written twice before this existed, and both copies missed the fill change
 * that moved every other frame mark to the paper. One source now.
 */
export default function FullBleedRule({ className = "" }: FullBleedRuleProps) {
  return (
    <div
      className={`edge-glow-shell edge-glow-shell-horizontal relative -mx-4 h-px sm:-mx-8 md:-mx-16 ${className}`}
    >
      {/* Full-bleed glow strip (like main's hairlines) — the dashed line
          extends ±9999px past the card, so its glow must too. A clipped
          .edge-glow-layer would go dark the moment the cursor leaves the
          card column. */}
      <div
        className="edge-glow-line absolute top-0 right-[-9999px] left-[-9999px] z-10 h-px"
        aria-hidden="true"
      />
      <div className="border-accent/20 absolute top-0 right-[-9999px] left-[-9999px] border-t border-dashed" />
      <CornerDiamond position="tl" variant="frame" />
      <CornerDiamond position="tr" variant="frame" />
    </div>
  );
}
