import { CSS_TRANSITIONS } from "@/lib/config/animation";

interface ArrowUpRightProps {
  size?: number;
  className?: string;
  /**
   * What the pointer has to be over. "self" suits a mark sitting on a large
   * surface that is itself hoverable — a project plate — where reacting to the
   * whole tile is motion with nothing behind it. "link" suits an arrow that
   * trails a short label, where the label and the arrow are one target.
   */
  trigger?: "self" | "link";
}

const glyph = (
  <>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </>
);

/**
 * Two arrows sharing one clipped track: the resting one leaves through the
 * top-right corner while its twin arrives from the bottom-left, so the mark
 * reads as departing rather than nudging.
 *
 * Reacts to hovering the arrow itself, not its card. Inside a project plate the
 * whole tile is already a hover target, and firing this from the card meant the
 * arrow flew every time the pointer crossed the tile — motion with nothing
 * behind it. Pointing at the arrow is the gesture that means "open this".
 *
 * CSS-only: no state, no effect, no listener. The React port of this in the
 * marketing site wires mouseenter/mouseleave to the closest anchor to achieve
 * the same, which is a subscription bought for nothing.
 */
export default function ArrowUpRight({
  size = 14,
  className = "",
  trigger = "self",
}: ArrowUpRightProps) {
  const svg = "absolute inset-0 h-full w-full transition-transform motion-reduce:transition-none";
  // Written out rather than composed: Tailwind matches whole class names in
  // source, so a interpolated `${prefix}:translate-x-5` produces no CSS.
  const leaves =
    trigger === "link"
      ? "group-hover:translate-x-5 group-hover:-translate-y-5 group-focus-visible:translate-x-5 group-focus-visible:-translate-y-5"
      : "group-hover/arrow:translate-x-5 group-hover/arrow:-translate-y-5";
  const arrives =
    trigger === "link"
      ? "group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0"
      : "group-hover/arrow:translate-x-0 group-hover/arrow:translate-y-0";

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 align-middle ${trigger === "self" ? "group/arrow" : ""} ${className}`}
      // overflow-clip-margin keeps the stroke from being shaved at the edge on
      // its way out; Tailwind has no utility for it.
      style={{ width: size, height: size, overflow: "clip", overflowClipMargin: "2px" }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${svg} ${leaves}`}
        style={CSS_TRANSITIONS.border}
      >
        {glyph}
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${svg} translate-x-[-1.25rem] translate-y-5 ${arrives}`}
        style={CSS_TRANSITIONS.border}
      >
        {glyph}
      </svg>
    </span>
  );
}
