/**
 * Design System Constants
 * Centralized configuration for consistent visual design
 */

export const ICON_CONFIG = {
  /**
   * Stroke width for all icons, matched to the hairline weight the rest of the
   * interface is drawn in. Heavier strokes exist only where the contrast is the
   * point (the copy-confirm checkmark) or where the viewBox is huge.
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
