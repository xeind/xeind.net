"use client";

import ThemeSwitcher from "@/components/ThemeSwitcher";

// Build-time git info (set during build). Prefer a commit-date env var for determinism
// deterministic — the build pipeline should set NEXT_PUBLIC_BUILD_DATE.
const BUILD_INFO = {
  commit: process.env.NEXT_PUBLIC_GIT_COMMIT_HASH || "dev",
  date:
    process.env.NEXT_PUBLIC_GIT_COMMIT_DATE ||
    process.env.NEXT_PUBLIC_BUILD_DATE ||
    "1970-01-01T00:00:00Z",
};

export default function Footer() {
  const buildDate = new Date(BUILD_INFO.date)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  // Derive year from the build date so server and client render identically.
  const currentYear = new Date(BUILD_INFO.date).getFullYear();

  return (
    <footer
      className="text-foreground fixed right-0 bottom-0 left-0 -z-10 flex flex-col justify-end"
      style={{
        paddingRight: "var(--scrollbar-width, 0px)",
        height: "var(--footer-height)", // Footer only takes 128px
      }}
    >
      {/* Background - covers full screen width */}
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

      {/* Content container - constrained width */}
      <div className="relative mx-auto h-full w-full max-w-5xl">
        <div className="relative z-10 h-full p-6 px-6 sm:px-8 md:p-8 md:px-12">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-background font-mono text-xs">
                © {currentYear} XD
              </p>
              <p className="text-background flex items-center gap-2 font-mono text-xs">
                Served with Bun{" "}
                <span className="bg-background inline-block h-1 w-1 shrink-0" />{" "}
                Next.js
              </p>
              <p className="text-background hidden items-center gap-2 font-mono text-xs sm:flex">
                Fonts: Latin Modern{" "}
                <span className="bg-background inline-block h-1 w-1 shrink-0" />{" "}
                Inter{" "}
                <span className="bg-background inline-block h-1 w-1 shrink-0" />{" "}
                Commit Mono
              </p>
              <p className="text-background flex items-center gap-2 font-mono text-xs opacity-70">
                {BUILD_INFO.commit}{" "}
                <span className="bg-background inline-block h-1 w-1 shrink-0" />{" "}
                Last Built: {buildDate}
              </p>
            </div>

            {/* Theme Switcher - Always side-by-side on all screen sizes */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
