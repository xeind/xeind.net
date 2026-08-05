import { CSS_TRANSITIONS } from "@/lib/config/animation";

/**
 * The hover frame, as shared primitives — dashed borders that firm up, corner
 * brackets that recolor, the tertiary hover wash. Previously copy-pasted into
 * each grid; one implementation so cards cannot drift apart.
 *
 * The host element is the hover group: it carries `group relative` and these
 * render inside it. Brackets promise a modal (design-system.md §5) — a card
 * that opens nothing takes DashedBorders alone.
 */

const t = CSS_TRANSITIONS.border;
const tFast = CSS_TRANSITIONS.fade;

/** Dashed borders (4 sides) that become solid on group hover/focus */
export function DashedBorders() {
  return (
    <>
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 z-10 border-t border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 z-10 border-r border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 z-10 border-b border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 z-10 border-l border-dashed transition-all group-focus-within:border-solid group-hover:border-solid"
        style={t}
      />
    </>
  );
}

/** L-shaped corner brackets that recolor to tertiary on group hover/focus */
export function CornerBrackets() {
  return (
    <>
      {/* Top-Left */}
      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
      </div>
      {/* Top-Right */}
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-px w-2 transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
      </div>
      {/* Bottom-Left */}
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary h-px w-2 transition-all"
          style={t}
        />
      </div>
      {/* Bottom-Right */}
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-2 w-px transition-all"
          style={t}
        />
        <div
          className="bg-accent group-hover:bg-tertiary group-focus-within:bg-tertiary ml-auto h-px w-2 transition-all"
          style={t}
        />
      </div>
    </>
  );
}

/**
 * Tertiary hover wash. `flash` adds the brighter press layer that carries
 * into a card's open animation — for cards that open something; a card that
 * doesn't (AwardsGrid) takes the hover wash alone.
 */
export function GradientBackground({ flash = true }: { flash?: boolean }) {
  if (!flash) {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30"
          style={t}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Hover wash */}
      <div
        className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30 group-active:opacity-0"
        style={t}
      />
      {/* Click flash — brighter wash that carries into the layout animation */}
      <div
        className="bg-tertiary/15 absolute inset-0 opacity-0 transition-opacity group-active:opacity-100"
        style={tFast}
      />
    </div>
  );
}
