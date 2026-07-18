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
