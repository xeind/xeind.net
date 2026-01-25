"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";

// Build-time git info (set during build)
const BUILD_INFO = {
  commit: process.env.NEXT_PUBLIC_GIT_COMMIT_HASH || "dev",
  date: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
};

export default function Footer() {
  const buildDate = new Date(BUILD_INFO.date)
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ""); // Format as YYYYMMDD

  // Dynamic current year for the copyright line
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-foreground fixed right-0 bottom-0 left-0 -z-10 flex flex-col justify-end"
      style={{
        paddingRight: "var(--scrollbar-width, 0px)",
        height: "var(--footer-height)", // Footer only takes 128px
      }}
    >
      {/* Background - covers only footer height */}
      <div className="bg-accent absolute inset-0">
        {/* Paper grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/grain-texture.webp')",
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* Border container - only footer height without vertical borders */}
      <div className="relative mx-auto h-full w-full max-w-5xl">
        {/* Content container */}
        <div className="relative z-10 h-full p-8 px-12">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-background font-mono text-xs">
                © {currentYear} XD
              </p>
              <p className="text-background font-mono text-xs">
                Served with Bun ⋅ Next.js
              </p>
              <p className="text-background font-mono text-xs">
                Fonts: Latin Modern · Inter · Commit Mono
              </p>
              <p className="text-background font-mono text-xs opacity-70">
                {BUILD_INFO.commit} · Last Built: {buildDate}
              </p>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
