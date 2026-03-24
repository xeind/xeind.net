/**
 * Design System Constants
 * Centralized configuration for consistent visual design
 */

export const ICON_CONFIG = {
  /**
   * Stroke width for all icons to match typography weight
   * 1.5px provides optimal balance with text-sm (14px) font
   */
  strokeWidth: 1,

  /**
   * Icon sizes aligned with typography scale
   */
  sizes: {
    xs: 8, // Small inline icons (mobile)
    sm: 10, // Inline with text-sm
    md: 20, // UI elements (buttons, cards)
    lg: 24, // Prominent elements
    xl: 64, // Logos and hero elements
  },
} as const;

/**
 * Border System Configuration
 * Unified border styling across all components
 */
export const BORDER_CONFIG = {
  /**
   * Border widths
   */
  width: {
    thin: "1px", // Default border (dividers, cards)
    medium: "2px", // Emphasized borders (focus states)
    thick: "3px", // Heavy borders (rare, special emphasis)
  },

  /**
   * Border opacity levels
   * All borders use accent color with varying opacity
   */
  opacity: {
    subtle: "border-accent/10", // Very faint (background patterns)
    light: "border-accent/20", // Light (section dividers)
    medium: "border-accent/30", // Medium (card borders, hover states)
    visible: "border-accent/50", // Visible (active/focus states)
    solid: "border-accent", // Solid (primary borders, emphasis)
  },

  /**
   * Border radius
   * Follows "sharp, technical corners" philosophy
   */
  radius: {
    none: "0", // Default - sharp corners
    sm: "0.25rem", // 4px - Subtle rounding (rare use)
    md: "0.5rem", // 8px - Medium rounding (buttons, inputs)
    lg: "0.75rem", // 12px - Large rounding (cards, modals)
  },

  /**
   * Common border class combinations
   */
  classes: {
    default: "border border-accent/20", // Standard border
    emphasized: "border-2 border-accent/30", // Emphasized border
    focus: "border-2 border-accent/50", // Focus state
    solid: "border border-accent", // Solid accent border
  },
} as const;

/**
 * Z-Index System
 * Layer hierarchy for consistent stacking
 */
export const Z_INDEX = {
  background: -10, // Footer background layer
  base: 0, // Default layer
  content: 10, // Main content layer
  overlay: 40, // Dropdown overlays, tooltips
  grain: 99, // Paper grain texture (fixed)
  modal: 100, // Modals, dialogs
} as const;

/**
 * Extended Color System
 * Additional semantic colors for richer UI variety
 *
 * Usage: Apply via Tailwind classes or CSS variables
 *
 * @example
 * // Use primary (purple in Kanagawa)
 * <button className="bg-primary hover:bg-primary-hover">
 *
 * // Use secondary (orange in Kanagawa)
 * <span className="text-secondary">Warning</span>
 *
 * // Use tertiary (green in Kanagawa)
 * <div className="border-tertiary">Success</div>
 */
export const COLOR_VARIANTS = {
  /**
   * Semantic color usage guide
   */
  usage: {
    primary: "Main accent - links, primary buttons, focus states",
    secondary: "Secondary accent - hover states, warnings, highlights",
    tertiary: "Third accent - success states, positive feedback",
    info: "Informational elements - tips, neutral notifications",
    warning: "Warning states - alerts, caution messages",

    // Tailwind class examples
    classes: {
      primary: "text-primary bg-primary border-primary",
      secondary: "text-secondary bg-secondary border-secondary",
      tertiary: "text-tertiary bg-tertiary border-tertiary",
      info: "text-info bg-info border-info",
      warning: "text-warning bg-warning border-warning",
    },
  },

  /**
   * Opacity levels for color variants
   */
  opacity: {
    subtle: "/10", // Very faint backgrounds
    light: "/20", // Light accents
    medium: "/30", // Medium emphasis
    visible: "/50", // Clear visibility
    solid: "", // Full opacity
  },
} as const;
