import { useRef, useState, useEffect, useCallback } from "react";
import { prepareWithSegments, layoutWithLines, type LayoutLine } from "@chenglou/pretext";

interface PretextBlockProps {
  children: string;
  font?: string;
  lineHeight?: number;
  className?: string;
}

/**
 * PretextBlock — Renders text through chenglou/pretext's layout engine.
 * Each line is a positioned DOM element, giving per-line control
 * while keeping text selectable.
 */
export default function PretextBlock({
  children,
  font = '16px "Latin Modern Roman", "Iowan Old Style", Georgia, serif',
  lineHeight = 32, // 16px type on the 8px baseline grid — matches leading-8 prose
  className = "",
}: PretextBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<LayoutLine[]>([]);
  const [height, setHeight] = useState(0);

  const layoutText = useCallback(() => {
    const el = containerRef.current;
    if (!el || !children) return;

    const width = el.clientWidth;
    if (width <= 0) return;

    const prepared = prepareWithSegments(children, font);
    const result = layoutWithLines(prepared, width, lineHeight);

    setLines(result.lines);
    // Not result.height: pretext reports a font-metric height, which is
    // fractional. The spans sit at i × lineHeight, so the box is exactly
    // lines × lineHeight — and stays on the 8px baseline grid.
    setHeight(result.lines.length * lineHeight);
  }, [children, font, lineHeight]);

  useEffect(() => {
    layoutText();

    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => layoutText());
    ro.observe(el);
    return () => ro.disconnect();
  }, [layoutText]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: height || "auto" }}
    >
      {lines.map((line, i) => (
        <span
          key={`${i}-${line.text.slice(0, 8)}`}
          className="absolute left-0 block"
          style={{
            top: i * lineHeight,
            lineHeight: `${lineHeight}px`,
          }}
        >
          {line.text}
        </span>
      ))}
    </div>
  );
}
