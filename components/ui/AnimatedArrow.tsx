"use client";

import { motion } from "motion/react";
import { DURATION, EASING } from "@/lib/config";

interface AnimatedArrowProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  isHovered?: boolean;
}

/**
 * AnimatedArrow - Custom SVG arrow with internal animation
 *
 * Animation sequence on hover:
 * 1. Arrow line draws from left to right (stroke-dashoffset)
 * 2. Arrow head appears and scales in
 * 3. Small trail dashes fade in behind
 *
 * Uses Motion for smooth SVG path animations
 */
export default function AnimatedArrow({
  size = 16,
  strokeWidth = 2,
  className = "",
  isHovered = false,
}: AnimatedArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Main arrow line - animates with stroke-dashoffset */}
      <motion.line
        x1="3"
        y1="12"
        x2="18"
        y2="12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0.6 }}
        animate={{ pathLength: isHovered ? 1 : 0.6 }}
        transition={{
          duration: DURATION.normal,
          ease: EASING.easeOutCubic as [number, number, number, number],
        }}
      />

      {/* Arrow head top line */}
      <motion.line
        x1="18"
        y1="12"
        x2="13"
        y2="7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{
          pathLength: isHovered ? 1 : 0.7,
          opacity: 1,
        }}
        transition={{
          duration: DURATION.normal,
          ease: EASING.easeOutCubic as [number, number, number, number],
          delay: isHovered ? 0.05 : 0,
        }}
      />

      {/* Arrow head bottom line */}
      <motion.line
        x1="18"
        y1="12"
        x2="13"
        y2="17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{
          pathLength: isHovered ? 1 : 0.7,
          opacity: 1,
        }}
        transition={{
          duration: DURATION.normal,
          ease: EASING.easeOutCubic as [number, number, number, number],
          delay: isHovered ? 0.05 : 0,
        }}
      />

      {/* Trail dash 1 - fades in on hover */}
      <motion.line
        x1="1"
        y1="12"
        x2="2"
        y2="12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{
          duration: DURATION.fast,
          ease: EASING.easeOutCubic as [number, number, number, number],
          delay: 0.1,
        }}
      />
    </svg>
  );
}
