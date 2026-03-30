"use client";

import { type CSSProperties, type ElementType, useState } from "react";
import { usePretextMeasure } from "@/lib/text/usePretextMeasure";

interface MeasuredTextProps {
  as?: ElementType;
  text: string;
  className?: string;
  style?: CSSProperties;
  whiteSpace?: "normal" | "pre-wrap";
  reserveHeight?: boolean;
}

export default function MeasuredText({
  as: Component = "p",
  text,
  className,
  style,
  whiteSpace = "normal",
  reserveHeight = false,
}: MeasuredTextProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const measurement = usePretextMeasure({ text, element, whiteSpace });

  const mergedStyle = {
    ...style,
    ...(reserveHeight && measurement
      ? { minHeight: `${measurement.height}px` }
      : null),
    ...(measurement
      ? {
          "--pretext-height": `${measurement.height}px`,
          "--pretext-line-count": String(measurement.lineCount),
        }
      : null),
  } satisfies CSSProperties;

  return (
    <Component
      ref={setElement}
      className={className}
      style={mergedStyle}
      data-measured-text
      data-pretext-ready={measurement ? "true" : "false"}
      data-pretext-lines={measurement?.lineCount}
    >
      {text}
    </Component>
  );
}
