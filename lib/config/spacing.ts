/**
 * Spacing Utility System
 * Pre-composed spacing classes for consistent component spacing
 * All values align with 16px grid system from grid.ts
 */

import { GRID_SYSTEM } from "./grid";

/**
 * Section Spacing
 * Standard spacing for major layout sections
 */
export const SECTION_SPACING = {
  /**
   * Standard section padding (SectionBlock, major containers)
   * px-12 = 48px (3 cells horizontal)
   * py-8 = 32px (2 cells vertical)
   */
  default: "px-12 py-8",

  /**
   * Horizontal only (Footer, horizontal sections)
   */
  horizontal: "px-12",

  /**
   * Vertical only (stacked sections)
   */
  vertical: "py-8",

  /**
   * Compact sections (less visual weight)
   */
  compact: "px-8 py-4", // 32px × 16px (2 cells × 1 cell)

  /**
   * Spacious sections (major divisions)
   */
  spacious: "px-16 py-12", // 64px × 48px (4 cells × 3 cells)
} as const;

/**
 * Gap Spacing
 * Flexbox/Grid gap utilities aligned to grid
 */
export const GAP_SPACING = {
  xs: "gap-2", // 8px  (0.5 cells) - Tight grouping
  sm: "gap-4", // 16px (1 cell)   - Related items
  md: "gap-8", // 32px (2 cells)  - Standard separation ⭐
  lg: "gap-12", // 48px (3 cells)  - Section spacing
  xl: "gap-16", // 64px (4 cells)  - Major divisions
} as const;

/**
 * Margin Spacing
 * Consistent margin values for layout
 */
export const MARGIN_SPACING = {
  none: "m-0",
  xs: "m-2", // 8px  (0.5 cells)
  sm: "m-4", // 16px (1 cell)
  md: "m-8", // 32px (2 cells) ⭐
  lg: "m-12", // 48px (3 cells)
  xl: "m-16", // 64px (4 cells)
} as const;

/**
 * Padding Spacing
 * Component-level padding utilities
 */
export const PADDING_SPACING = {
  none: "p-0",
  xs: "p-2", // 8px  (0.5 cells) - Tight padding
  sm: "p-4", // 16px (1 cell)   - Button padding
  md: "p-8", // 32px (2 cells)  - Card padding ⭐
  lg: "p-12", // 48px (3 cells)  - Section padding ⭐
  xl: "p-16", // 64px (4 cells)  - Hero padding
} as const;

/**
 * Stack Spacing (Vertical)
 * For stacked content (text blocks, lists)
 */
export const STACK_SPACING = {
  tight: "space-y-1", // 4px  - Compact lists
  normal: "space-y-4", // 16px - Standard stacking ⭐
  comfortable: "space-y-6", // 24px - Comfortable reading
  relaxed: "space-y-8", // 32px - Breathing room
  loose: "space-y-12", // 48px - Major sections
} as const;

/**
 * Inline Spacing (Horizontal)
 * For horizontal layouts (tags, breadcrumbs)
 */
export const INLINE_SPACING = {
  tight: "space-x-1", // 4px  - Compact inline
  normal: "space-x-4", // 16px - Standard inline ⭐
  relaxed: "space-x-8", // 32px - Breathing room
  loose: "space-x-12", // 48px - Major divisions
} as const;

/**
 * Common Spacing Combinations
 * Pre-composed patterns for frequent use cases
 */
export const SPACING_PATTERNS = {
  /**
   * Card spacing (standard content card)
   */
  card: "p-8 space-y-4",

  /**
   * List item spacing (interactive list items)
   */
  listItem: "px-4 py-3 space-y-2",

  /**
   * Form field spacing
   */
  formField: "space-y-2",

  /**
   * Button group spacing (multiple buttons)
   */
  buttonGroup: "flex gap-4",

  /**
   * Section header spacing (title + description)
   */
  sectionHeader: "space-y-4 mb-8",

  /**
   * Footer content spacing
   */
  footer: "px-12 pb-8 space-y-1",
} as const;

/**
 * Grid-aligned pixel values for programmatic use
 * Use these when you need numeric values (e.g., calculations, inline styles)
 */
export const SPACING_PX = {
  none: 0,
  xs: GRID_SYSTEM.px.xs, // 8px
  sm: GRID_SYSTEM.px.sm, // 16px
  md: GRID_SYSTEM.px.md, // 32px
  lg: GRID_SYSTEM.px.lg, // 48px
  xl: GRID_SYSTEM.px.xl, // 64px
  "2xl": GRID_SYSTEM.px["2xl"], // 80px
  "3xl": GRID_SYSTEM.px["3xl"], // 96px
} as const;
