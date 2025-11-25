/**
 * Unified Design System Export
 * Single import point for all design tokens and configuration
 *
 * Usage:
 * import { ICON_CONFIG, TYPOGRAPHY, SPACING_PX, SPRING_CONFIG } from '@/lib/config';
 */

// Animation System
export { SPRING_CONFIG, EASING, DURATION, HOVER_TRANSITION } from "./animation";

// Visual Design
export { ICON_CONFIG, BORDER_CONFIG, Z_INDEX } from "./design";

// Grid & Layout
export {
  GRID_SYSTEM,
  cellsToPx,
  pxToCells,
  isGridAligned,
  snapToGrid,
  spacing,
} from "./grid";

// Spacing Utilities
export {
  SECTION_SPACING,
  GAP_SPACING,
  MARGIN_SPACING,
  PADDING_SPACING,
  STACK_SPACING,
  INLINE_SPACING,
  SPACING_PATTERNS,
  SPACING_PX,
} from "./spacing";

// Typography System
export { TYPOGRAPHY, TEXT_STYLES } from "./typography";

/**
 * Quick Reference:
 *
 * ANIMATIONS:
 * - SPRING_CONFIG.noBounce - Smooth animations without overshoot
 * - EASING.easeOutQuad - Fast entrance animations
 * - DURATION.fast (0.15s) - Quick transitions
 *
 * DESIGN:
 * - ICON_CONFIG.strokeWidth (1) - Consistent icon weight
 * - BORDER_CONFIG.opacity.light - Standard borders
 * - Z_INDEX.modal (100) - Layer hierarchy
 *
 * SPACING:
 * - SECTION_SPACING.default - "px-12 py-8" (standard sections)
 * - GAP_SPACING.md - "gap-8" (32px between elements)
 * - SPACING_PATTERNS.card - Pre-composed card spacing
 *
 * TYPOGRAPHY:
 * - TYPOGRAPHY.fontFamily.mono - Monospace font variable
 * - TEXT_STYLES.meta - Pre-composed meta text style
 * - TYPOGRAPHY.fontSize.sm - 0.875rem (14px)
 *
 * GRID:
 * - GRID_SYSTEM.cellSize (16) - Base grid unit
 * - cellsToPx(3) - Convert 3 cells to 48px
 * - SPACING_PX.lg - 48px for calculations
 */
