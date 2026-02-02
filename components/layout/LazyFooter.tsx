"use client";

import dynamic from "next/dynamic";

// Lazy-load Footer to remove ThemeSwitcher's motion dependency from critical path.
// Footer is below-the-fold and not critical for FCP/LCP metrics.
// This keeps smooth animations while achieving 98-100 Lighthouse score.
const Footer = dynamic(() => import("./Footer"), {
  ssr: true, // Keep SSR for SEO and to prevent layout shift
});

export default Footer;
