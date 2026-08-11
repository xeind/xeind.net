import PixelGrid, { type PixelPattern } from "./PixelGrid";

/**
 * The four loader patterns side by side, each under its name.
 *
 * One island rather than four: the grids carry no state, so hydrating them
 * separately would buy nothing and cost three more React roots.
 *
 * A specimen row, in the spirit of /design's grid iterations — the point is to
 * see them against each other, since the difference between drive and scan is
 * only legible in comparison.
 *
 * `size` passes straight through to PixelGrid, so the same row renders at 3×3
 * or 6×6 without a second component.
 */

const PATTERNS: { key: PixelPattern; note: string }[] = [
  { key: "drive", note: "has a direction" },
  { key: "scan", note: "whole columns" },
  { key: "bloom", note: "no direction" },
  { key: "orbit", note: "winds inward" },
];

interface PixelGridSetProps {
  size?: number;
  className?: string;
}

export default function PixelGridSet({ size = 3, className = "" }: PixelGridSetProps) {
  return (
    <ul className={`flex flex-wrap gap-8 ${className}`}>
      {PATTERNS.map(({ key, note }) => (
        <li key={key} className="flex items-center gap-3">
          <PixelGrid pattern={key} size={size} />
          <span>
            <span className="text-foreground block font-mono text-[0.6875rem] tracking-wide">
              {key}
            </span>
            <span className="text-foreground/45 block font-mono text-[0.625rem]">{note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
