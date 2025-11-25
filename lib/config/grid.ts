/**
 * Unified Grid System
 * All spacing, padding, and layouts align to a 16px base grid
 * This ensures visual harmony and perfect grid alignment
 */

export const GRID_SYSTEM = {
  /**
   * Base grid cell size (matches .bg-grid-pattern and .bg-hero-grid)
   */
  cellSize: 16,

  /**
   * Standard spacing scale (in grid cells)
   * Use these multipliers for consistent spacing
   */
  spacing: {
    none: 0, // 0px
    xs: 0.5, // 8px  - Half cell (use sparingly)
    sm: 1, // 16px - 1 cell
    md: 2, // 32px - 2 cells ⭐ RECOMMENDED
    lg: 3, // 48px - 3 cells ⭐ RECOMMENDED
    xl: 4, // 64px - 4 cells
    "2xl": 5, // 80px - 5 cells
    "3xl": 6, // 96px - 6 cells
  },

  /**
   * Pixel values for each spacing level
   */
  px: {
    none: 0,
    xs: 8,
    sm: 16,
    md: 32,
    lg: 48,
    xl: 64,
    "2xl": 80,
    "3xl": 96,
  },

  /**
   * Tailwind class mappings for grid-aligned spacing
   */
  tailwind: {
    none: "p-0",
    xs: "p-2", // 8px  - Half cell
    sm: "p-4", // 16px - 1 cell
    md: "p-8", // 32px - 2 cells ⭐
    lg: "p-12", // 48px - 3 cells ⭐
    xl: "p-16", // 64px - 4 cells
    "2xl": "p-20", // 80px - 5 cells
    "3xl": "p-24", // 96px - 6 cells
  },
} as const;

/**
 * Helper: Convert grid cells to pixels
 * @example cellsToPx(3) // 48
 */
export const cellsToPx = (cells: number): number =>
  cells * GRID_SYSTEM.cellSize;

/**
 * Helper: Convert pixels to grid cells
 * @example pxToCells(48) // 3
 */
export const pxToCells = (px: number): number => px / GRID_SYSTEM.cellSize;

/**
 * Helper: Check if a pixel value aligns with the grid
 * @example isGridAligned(48) // true
 * @example isGridAligned(24) // false (1.5 cells)
 */
export const isGridAligned = (px: number): boolean =>
  px % GRID_SYSTEM.cellSize === 0;

/**
 * Helper: Get nearest grid-aligned value
 * @example snapToGrid(26) // 32 (rounds up to 2 cells)
 */
export const snapToGrid = (px: number): number => {
  const cells = Math.round(px / GRID_SYSTEM.cellSize);
  return cells * GRID_SYSTEM.cellSize;
};

/**
 * Grid-aligned spacing values for use in components
 * @example spacing.md // "32px" or 32
 */
export const spacing = {
  none: 0,
  xs: GRID_SYSTEM.px.xs,
  sm: GRID_SYSTEM.px.sm,
  md: GRID_SYSTEM.px.md,
  lg: GRID_SYSTEM.px.lg,
  xl: GRID_SYSTEM.px.xl,
  "2xl": GRID_SYSTEM.px["2xl"],
  "3xl": GRID_SYSTEM.px["3xl"],
} as const;
