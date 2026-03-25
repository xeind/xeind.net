import React from "react";
import clsx from "clsx";
import { TRANSITIONS } from "@/lib/config/animation";

interface CardFrameProps {
  children: React.ReactNode;
  variant?: "interactive" | "static" | "minimal" | "none";
  corners?: "brackets" | "diamonds" | "none";
  borderColor?: "accent-30" | "accent-20" | "foreground-30";
  cornerColor?: "accent" | "tertiary";
  cornerHoverColor?: "tertiary" | "accent";
  showFocusRing?: boolean;
  enableActiveState?: boolean;
  cornerSize?: 8 | 12 | 16;
  edges?: "all" | "top-bottom" | "bottom-only";
  className?: string;
  as?: React.ElementType;
}

const borderColorMap = {
  "accent-30": "border-accent/30",
  "accent-20": "border-accent/20",
  "foreground-30": "border-foreground/30",
};

const cornerColorMap = {
  accent: "bg-accent",
  tertiary: "bg-tertiary",
};

const cornerHoverColorMap = {
  tertiary: "group-hover:bg-tertiary",
  accent: "group-hover:bg-accent",
};

export default function CardFrame({
  children,
  variant = "interactive",
  corners = "brackets",
  borderColor = "accent-30",
  cornerColor = "accent",
  cornerHoverColor = "tertiary",
  showFocusRing = true,
  enableActiveState = false,
  cornerSize = 8,
  edges = "all",
  className,
  as: Component = "div",
}: CardFrameProps) {
  const baseClasses = clsx(
    "relative",
    showFocusRing &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant !== "none" && "group",
    className
  );

  const getBorderClasses = () => {
    const baseBorder = borderColorMap[borderColor];

    switch (edges) {
      case "top-bottom":
        return `${baseBorder} border-t border-b`;
      case "bottom-only":
        return `${baseBorder} border-b`;
      case "all":
      default:
        return `${baseBorder} border`;
    }
  };

  const getBorderStyleClasses = () => {
    // Note: duration-200 (200ms) matches TRANSITIONS.border.duration (0.2s)
    switch (variant) {
      case "interactive":
        return "border-dashed transition-all duration-200 ease-out-cubic group-hover:border-solid";
      case "static":
        return "border-solid";
      case "minimal":
        return "border-dashed";
      case "none":
        return "";
      default:
        return "";
    }
  };

  const getCornerClasses = () => {
    const sizeClass =
      cornerSize === 12 ? "w-3 h-3" : cornerSize === 16 ? "w-4 h-4" : "w-2 h-2";
    const thickness = "w-px h-px";
    const colorClass = cornerColorMap[cornerColor];
    const hoverClass = cornerHoverColorMap[cornerHoverColor];

    return {
      sizeClass,
      thickness,
      colorClass,
      hoverClass,
    };
  };

  const { sizeClass, thickness, colorClass, hoverClass } = getCornerClasses();

  const renderBrackets = () => {
    if (corners !== "brackets") return null;

    const bracketProps = {
      // Note: duration-200 (200ms) matches TRANSITIONS.border.duration (0.2s)
      className: clsx(
        "absolute pointer-events-none transition-colors duration-200",
        colorClass,
        hoverClass
      ),
    };

    return (
      <>
        {/* Top Left */}
        <div {...bracketProps} style={{ top: 0, left: 0 }}>
          <div className={clsx("h-px", sizeClass, thickness)} />
          <div className={clsx("w-px", thickness, sizeClass)} />
        </div>

        {/* Top Right */}
        <div {...bracketProps} style={{ top: 0, right: 0 }}>
          <div className={clsx("h-px", sizeClass, thickness)} />
          <div className={clsx("w-px", thickness, sizeClass)} />
        </div>

        {/* Bottom Left */}
        <div {...bracketProps} style={{ bottom: 0, left: 0 }}>
          <div className={clsx("h-px", sizeClass, thickness)} />
          <div className={clsx("w-px", thickness, sizeClass)} />
        </div>

        {/* Bottom Right */}
        <div {...bracketProps} style={{ bottom: 0, right: 0 }}>
          <div className={clsx("h-px", sizeClass, thickness)} />
          <div className={clsx("w-px", thickness, sizeClass)} />
        </div>
      </>
    );
  };

  const renderDiamonds = () => {
    if (corners !== "diamonds") return null;

    const diamondClass = clsx(
      "absolute rotate-45 border border-accent/20 bg-card pointer-events-none",
      sizeClass === "w-2 h-2" ? "w-2 h-2" : sizeClass
    );

    return (
      <>
        <div className={diamondClass} style={{ top: -4, left: -4 }} />
        <div className={diamondClass} style={{ top: -4, right: -4 }} />
        <div className={diamondClass} style={{ bottom: -4, left: -4 }} />
        <div className={diamondClass} style={{ bottom: -4, right: -4 }} />
      </>
    );
  };

  const renderBorders = () => {
    if (variant === "none") return null;

    const borderClasses = getBorderClasses();
    const styleClasses = getBorderStyleClasses();

    if (edges === "all") {
      return (
        <div
          className={clsx(
            "absolute inset-0 pointer-events-none",
            borderClasses,
            styleClasses
          )}
        />
      );
    }

    // For partial edges, render individual border divs
    return (
      <>
        {edges === "top-bottom" && (
          <>
            <div
              className={clsx(
                "absolute top-0 left-0 right-0 h-px pointer-events-none",
                borderClasses,
                styleClasses
              )}
            />
            <div
              className={clsx(
                "absolute bottom-0 left-0 right-0 h-px pointer-events-none",
                borderClasses,
                styleClasses
              )}
            />
          </>
        )}
        {edges === "bottom-only" && (
          <div
            className={clsx(
              "absolute bottom-0 left-0 right-0 h-px pointer-events-none",
              borderClasses,
              styleClasses
            )}
          />
        )}
      </>
    );
  };

  return (
    <Component className={baseClasses}>
      {renderBorders()}
      {renderBrackets()}
      {renderDiamonds()}
      {children}
    </Component>
  );
}
