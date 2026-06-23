"use client";

import dynamic from "next/dynamic";

// Lazy-load Footer to defer ThemeSwitcher's motion dependency from critical path.
// Footer is fixed behind content (-z-10), not visible on initial load.
const Footer = dynamic(() => import("./Footer"), {
  ssr: true,
});

export default Footer;
