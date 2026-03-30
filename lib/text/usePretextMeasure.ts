"use client";

import { useEffect, useState } from "react";
import { layout, prepare } from "@chenglou/pretext";

interface UsePretextMeasureOptions {
  text: string;
  element: HTMLElement | null;
  whiteSpace?: "normal" | "pre-wrap";
}

interface PretextMeasurement {
  height: number;
  lineCount: number;
}

function getLineHeightPx(computedStyle: CSSStyleDeclaration) {
  const lineHeight = computedStyle.lineHeight;
  if (lineHeight.endsWith("px")) {
    return Number.parseFloat(lineHeight);
  }

  const fontSize = Number.parseFloat(computedStyle.fontSize);
  if (Number.isFinite(fontSize) && fontSize > 0) {
    return fontSize * 1.5;
  }

  return 24;
}

export function usePretextMeasure({
  text,
  element,
  whiteSpace = "normal",
}: UsePretextMeasureOptions) {
  const [measurement, setMeasurement] = useState<PretextMeasurement | null>(
    null
  );

  useEffect(() => {
    if (!element || text.trim().length === 0) {
      setMeasurement(null);
      return;
    }

    let cancelled = false;

    const measure = async () => {
      if (typeof document === "undefined") return;

      if ("fonts" in document) {
        await document.fonts.ready;
      }

      if (cancelled || !element) return;

      const width = element.clientWidth;
      if (width <= 0) return;

      const computedStyle = window.getComputedStyle(element);
      const font = computedStyle.font;
      const lineHeight = getLineHeightPx(computedStyle);
      const prepared = prepare(text, font, { whiteSpace });
      const { height, lineCount } = layout(prepared, width, lineHeight);

      if (!cancelled) {
        setMeasurement({
          height: Math.ceil(height),
          lineCount,
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      void measure();
    });

    resizeObserver.observe(element);
    void measure();

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [element, text, whiteSpace]);

  return measurement;
}
