import XeinLogo from "../XeinLogo";

/**
 * StaticLogo - Non-interactive logo for immediate render
 *
 * Used in HeroSection for instant LCP (Largest Contentful Paint).
 * No click handlers, no portal, no motion - just the SVG.
 *
 * For copy functionality, use CopyableLogo (lazy-loaded).
 */
export default XeinLogo;
