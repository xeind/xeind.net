"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/lib/hooks";

interface AnchoredPopupProps {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  visible: boolean;
  onClose: () => void;
  label: string;
}

const GAP = 8;
const TAIL_W = 6;
const TAIL_H = 5;

export default function AnchoredPopup({
  triggerRef,
  visible,
  onClose,
  label,
}: AnchoredPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [visible, triggerRef, onClose]);

  const boxW = 140;
  const boxH = 20;
  const svgW = boxW + 2;
  const svgH = boxH + TAIL_H + 2;
  const cx = svgW / 2;

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

  const getPosition = () => {
    if (!triggerRef.current) return { x: 0, y: 0 };
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.bottom + GAP,
    };
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={popupRef}
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
            left: getPosition().x,
            top: getPosition().y,
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
              x={cx}
              y={TAIL_H + 1 + boxH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground font-mono text-[0.6875rem]"
            >
              {label}
            </text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
