"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check } from "lucide-react";
import { useReducedMotion, useClickSound } from "@/lib/hooks";
import { ICON_CONFIG } from "@/lib/config/design";
import XeinLogo from "./XeinLogo";

interface LogoCopyDropdownProps {
  size?: number;
  className?: string;
}

const GAP = 8;
const TAIL_W = 6;
const TAIL_H = 5;
const PAD_X = 8;
const PAD_Y = 3;

export default function LogoCopyDropdown({
  size = 64,
  className = "",
}: LogoCopyDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState({ w: 0, h: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { click } = useClickSound();

  // Measure text
  useEffect(() => {
    if (!textRef.current || !visible) return;
    const bbox = textRef.current.getBBox();
    setTextSize({ w: bbox.width, h: bbox.height });
  }, [visible, copied]);

  // Update position when visible
  useEffect(() => {
    if (!visible || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current?.offsetHeight ?? 0;
      // Position BELOW the trigger (instead of above like Tooltip)
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.bottom + GAP + tooltipHeight,
      });
    };

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });

    const hideOnScroll = () => setVisible(false);
    window.addEventListener("scroll", hideOnScroll, true);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", hideOnScroll, true);
    };
  }, [visible]);

  const handleClick = useCallback(() => {
    click();

    if (!visible) {
      setVisible(true);
    } else if (!copied) {
      const svgElement = document.querySelector(".xein-logo svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        navigator.clipboard.writeText(svgString);
        setCopied(true);

        setTimeout(() => {
          setVisible(false);
          setCopied(false);
        }, 2000);
      }
    }
  }, [click, visible, copied]);

  // Hide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
        setCopied(false);
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [visible]);

  const label = copied ? "Copied!" : "Copy logo as SVG";
  const boxW = textSize.w + PAD_X * 2;
  const boxH = textSize.h + PAD_Y * 2;
  const svgW = boxW + 2;
  const svgH = boxH + TAIL_H + 2;
  const cx = svgW / 2;

  // Path: rectangle with tail on TOP (pointing up to logo)
  const d = [
    `M 1 ${TAIL_H + 1}`,
    `L ${cx - TAIL_W} ${TAIL_H + 1}`,
    `L ${cx} 1`,
    `L ${cx + TAIL_W} ${TAIL_H + 1}`,
    `H ${boxW + 1}`,
    `V ${boxH + TAIL_H + 1}`,
    `H 1`,
    `Z`,
  ].join(" ");

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleClick}
        className={`group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        aria-label="Copy logo as SVG"
      >
        <XeinLogo size={size} />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                ref={tooltipRef}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97, y: -10 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.97, y: -5 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.12, ease: [0.215, 0.61, 0.355, 1] }
                }
                className="pointer-events-none fixed z-50"
                style={{
                  left: coords.x,
                  top: coords.y - (tooltipRef.current?.offsetHeight ?? 0),
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
                    y={TAIL_H + PAD_Y + textSize.h * 0.82}
                    textAnchor="middle"
                    className={`font-mono text-[0.6875rem] ${copied ? "fill-success" : "fill-foreground"}`}
                  >
                    {label}
                  </text>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
