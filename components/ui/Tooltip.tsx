"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/lib/hooks";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

const GAP = 0;
const TAIL_W = 6;
const TAIL_H = 5;
const PAD_X = 8;
const PAD_Y = 3;

export default function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState({ w: 0, h: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const prefersReducedMotion = useReducedMotion();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 0;
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top - GAP - tooltipHeight,
    });
  }, []);

  // Measure text on mount/label change
  useEffect(() => {
    if (!textRef.current) return;
    const bbox = textRef.current.getBBox();
    setTextSize({ w: bbox.width, h: bbox.height });
  }, [label, visible]);

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });
    const hideOnScroll = () => setVisible(false);
    window.addEventListener("scroll", hideOnScroll, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", hideOnScroll, true);
    };
  }, [visible, textSize, updatePosition]);

  const boxW = textSize.w + PAD_X * 2;
  const boxH = textSize.h + PAD_Y * 2;
  const svgW = boxW + 2; // 1px stroke padding
  const svgH = boxH + TAIL_H + 2;
  const cx = svgW / 2;

  // One continuous path: rectangle + tail notch on bottom edge
  // Start top-left, go clockwise. Bottom edge splits to form the tail.
  const d = [
    `M 1 1`,
    `H ${boxW + 1}`,
    `V ${boxH + 1}`,
    `H ${cx + TAIL_W}`,
    `L ${cx} ${boxH + TAIL_H + 1}`,
    `L ${cx - TAIL_W} ${boxH + 1}`,
    `H 1`,
    `Z`,
  ].join(" ");

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onClick={() => {
        setVisible(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }}
    >
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                ref={tooltipRef}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.97 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.12, ease: [0.215, 0.61, 0.355, 1] }
                }
                className="pointer-events-none fixed z-50"
                style={{
                  left: coords.x,
                  top: coords.y,
                  x: "-50%",
                }}
              >
                <svg
                  width={svgW}
                  height={svgH}
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="block"
                >
                  <path
                    d={d}
                    className="fill-card stroke-accent/30"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                  <text
                    ref={textRef}
                    x={cx}
                    y={1 + PAD_Y + textSize.h * 0.82}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[0.6875rem]"
                  >
                    {label}
                  </text>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}
