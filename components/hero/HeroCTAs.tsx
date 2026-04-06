"use client";

import { CSS_TRANSITIONS } from "@/lib/config/animation";
import { GAP_SPACING } from "@/lib/config/spacing";
import { useClickSound } from "@/lib/hooks";
import { personalInfo } from "@/lib/data";

interface HeroActionLinkProps {
  children: React.ReactNode;
  href: string;
  badge?: string;
  target?: string;
  rel?: string;
}

function HeroActionLink({
  children,
  href,
  badge,
  target = "_blank",
  rel = "noopener noreferrer",
}: HeroActionLinkProps) {
  const { clickSoft } = useClickSound();

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={clickSoft}
      className="bg-card group relative inline-flex items-center justify-center gap-3 px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-12"
      style={CSS_TRANSITIONS.border}
    >
      <div
        className="border-accent/30 absolute top-0 right-0 left-0 border-t border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute top-0 right-0 bottom-0 border-r border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute right-0 bottom-0 left-0 border-b border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />
      <div
        className="border-accent/30 absolute top-0 bottom-0 left-0 border-l border-dashed transition-all group-hover:border-solid"
        style={CSS_TRANSITIONS.border}
      />

      <div className="absolute top-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>
      <div className="absolute top-0 right-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>
      <div className="absolute bottom-0 left-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>
      <div className="absolute right-0 bottom-0 z-10">
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-2 w-px transition-all"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-accent group-hover:bg-tertiary ml-auto h-px w-2 transition-all"
          style={CSS_TRANSITIONS.border}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="bg-accent/20 absolute inset-0 transition-opacity group-hover:opacity-0 group-active:opacity-0"
          style={{
            ...CSS_TRANSITIONS.border,
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.15) 87.5%, transparent 100%)",
          }}
        />
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-30 group-active:opacity-0"
          style={CSS_TRANSITIONS.border}
        />
        <div
          className="bg-tertiary/10 absolute inset-0 opacity-0 transition-opacity group-active:opacity-100"
          style={{
            ...CSS_TRANSITIONS.fade,
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.60) 12.5%, rgba(0,0,0,0.40) 32.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.40) 67.5%, rgba(0,0,0,0.60) 87.5%, rgba(0,0,0,0.60) 100%)",
          }}
        />
      </div>

      <div
        className={`relative z-10 flex items-center justify-center gap-3 ${GAP_SPACING.xs}`}
      >
        <span
          className="font-serif text-sm transition-all"
          style={CSS_TRANSITIONS.border}
        >
          {children}
        </span>
        {badge && (
          <span
            className="bg-accent/10 text-accent-hover/90 group-hover:text-tertiary group-hover:ring-tertiary/30 ring-accent/30 px-1.5 py-0.5 font-mono text-xs ring-1 transition-all"
            style={CSS_TRANSITIONS.border}
          >
            {badge}
          </span>
        )}
      </div>
    </a>
  );
}

export default function HeroCTAs() {
  return (
    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
      <HeroActionLink href={personalInfo.cvUrl} badge="V">
        View Resume
      </HeroActionLink>
      <HeroActionLink
        href={personalInfo.calComUrl || "https://cal.com/xeind"}
        target="_blank"
        rel="noopener noreferrer"
        badge="C"
      >
        Schedule Call
      </HeroActionLink>
    </div>
  );
}
