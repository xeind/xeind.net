import { CSS_TRANSITIONS } from "@/lib/config/animation";
import HeroLogo from "./HeroLogo";
import { GAP_SPACING } from "@/lib/config/spacing";
import { personalInfo } from "@/lib/data";
import { ICON_CONFIG } from "@/lib/config/design";

interface HeroActionLinkProps {
  children: React.ReactNode;
  href: string;
  badge?: string;
  target?: string;
  rel?: string;
  shortcut?: string;
}

function HeroActionLink({
  children,
  href,
  badge,
  target = "_blank",
  rel = "noopener noreferrer",
  shortcut,
}: HeroActionLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      data-hero-sfx="click"
      {...(shortcut ? { "data-hero-shortcut": shortcut } : {})}
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

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center md:items-start">
      {/* Logo, Name and Location */}
      <div className="mb-6 flex flex-row items-center gap-6">
        <HeroLogo size={64} className="text-foreground shrink-0" />

        <div className="flex flex-col gap-1 items-start text-left">
          <h1 className="text-foreground font-serif text-2xl font-normal tracking-tight">
            {personalInfo.name}
          </h1>
          <address className="not-italic text-foreground/60 flex items-center gap-1 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width={ICON_CONFIG.sizes.sm}
              height={ICON_CONFIG.sizes.sm}
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{personalInfo.location}</span>
          </address>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-foreground/80 mb-6 max-w-xl text-center md:text-left text-sm">
        {personalInfo.tagline}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
        <HeroActionLink href={personalInfo.cvUrl} badge="V" shortcut="v">
          View Resume
        </HeroActionLink>
        <HeroActionLink
          href={personalInfo.calComUrl || "https://cal.com/xeind"}
          target="_blank"
          rel="noopener noreferrer"
          badge="C"
          shortcut="c"
        >
          Schedule Call
        </HeroActionLink>
      </div>
    </div>
  );
}
