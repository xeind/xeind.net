/**
 * Typography System Constants
 * Centralized configuration for consistent text styling
 * Based on design philosophy in .github/reference-instructions.md
 */

export const TYPOGRAPHY = {
  /**
   * Font Family System
   * - Serif: Latin Modern Roman (Headings, Names, Academic feel)
   * - Sans: Inter (Body text, UI, High readability)
   * - Mono: JetBrains Mono (Code, Meta, Tags, Coordinates)
   */
  fontFamily: {
    serif: "var(--font-serif)", // Latin Modern Roman - Project titles, "Xeind"
    sans: "var(--font-sans)", // Inter - Long-form text, descriptions
    mono: "var(--font-mono)", // JetBrains Mono - Dates, tags, navigation, meta
  },

  /**
   * Font Size Scale
   * Aligned with 16px grid system base unit
   */
  fontSize: {
    xs: "0.75rem", // 12px - Tiny meta (commit hash, timestamps)
    sm: "0.875rem", // 14px - UI text (buttons, labels)
    base: "1rem", // 16px - Body text (paragraphs, descriptions)
    lg: "1.125rem", // 18px - Subheadings
    xl: "1.25rem", // 20px - Section headings
    "2xl": "1.5rem", // 24px - Major section titles
    "3xl": "1.875rem", // 30px - Page titles
    "4xl": "2.25rem", // 36px - Hero text
  },

  /**
   * Line Height System
   * Controls text density and readability
   */
  lineHeight: {
    tight: 1.2, // Headings, titles
    normal: 1.5, // Body text, UI
    relaxed: 1.8, // Long-form reading
  },

  /**
   * Font Weight Scale
   */
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /**
   * Letter Spacing
   * Use sparingly - most text should use default tracking
   */
  letterSpacing: {
    tight: "-0.025em", // Headings, tight spacing
    normal: "0em", // Default - most text
    wide: "0.05em", // All caps, labels
  },
} as const;

/**
 * Typography Utility Classes
 * Pre-composed class combinations for common text styles
 */
export const TEXT_STYLES = {
  // Headings
  h1: "font-serif text-4xl font-bold leading-tight",
  h2: "font-serif text-3xl font-bold leading-tight",
  h3: "font-serif text-2xl font-semibold leading-tight",
  h4: "font-serif text-xl font-semibold leading-tight",

  // Body text
  body: "font-sans text-base leading-normal",
  bodyLarge: "font-sans text-lg leading-relaxed",
  bodySmall: "font-sans text-sm leading-normal",

  // UI elements
  button: "font-sans text-sm font-medium leading-normal",
  label: "font-sans text-sm font-medium leading-normal",

  // Meta/Code
  meta: "font-mono text-xs leading-normal",
  code: "font-mono text-sm leading-normal",
  tag: "font-mono text-xs leading-normal uppercase tracking-wide",

  // Special
  name: "font-serif text-2xl font-bold leading-tight", // "Xeind Deniel"
  projectTitle: "font-serif text-xl font-semibold leading-tight",
} as const;
