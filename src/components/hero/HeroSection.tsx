import { CSS_TRANSITIONS } from "@/lib/config/animation";
import StaticLogo from "./StaticLogo";
import { GAP_SPACING } from "@/lib/config/spacing";
import { personalInfo } from "@/lib/data/personal";
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
      data-hero-sfx-hover
      {...(shortcut ? { "data-hero-shortcut": shortcut } : {})}
      className="bg-card group focus-visible:ring-accent focus-visible:ring-offset-background relative inline-flex items-center justify-center gap-3 px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-12"
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

      <div className={`relative z-10 flex items-center justify-center gap-3 ${GAP_SPACING.xs}`}>
        <span className="font-serif text-sm transition-all" style={CSS_TRANSITIONS.border}>
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

const SOCIAL_ICONS: Record<string, string> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.082-.729.082-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.135-.304-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3.005-.404c1.02.005 2.047.138 3.005.404 2.295-1.552 3.3-1.23 3.3-1.23.645 1.653.24 2.872.12 3.176.765.838 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.922.435.375.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z",
  linkedin:
    "M20.447 20.452H16.89V14.87c0-1.332-.027-3.045-1.856-3.045-1.857 0-2.142 1.45-2.142 2.948v5.68H9.336V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.605 0 4.272 2.372 4.272 5.456zM5.337 7.433a2.063 2.063 0 1 1 0-4.127 2.063 2.063 0 0 1 0 4.127M7.119 20.452H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z",
  mail: "M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z",
};

function HeroSocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      data-hero-sfx="click"
      data-hero-sfx-hover
      className="text-foreground/80 hover:text-tertiary focus-visible:ring-accent focus-visible:ring-offset-background inline-flex min-h-10 min-w-10 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={CSS_TRANSITIONS.border}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[1.25em] w-[1.25em]"
        aria-hidden
      >
        <path d={SOCIAL_ICONS[icon]} />
      </svg>
      <span className="sr-only">{label}</span>
    </a>
  );
}

function HeroEmailButton({ email }: { email: string }) {
  return (
    <button
      type="button"
      aria-label="Copy email address"
      data-copy-email={email}
      data-hero-sfx="click"
      data-hero-sfx-hover
      className="text-foreground/80 hover:text-tertiary focus-visible:ring-accent focus-visible:ring-offset-background inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={CSS_TRANSITIONS.border}
    >
      <span className="relative inline-flex h-[1.25em] w-[1.25em]">
        <span
          data-email-icon="mail"
          className="absolute inset-0 inline-flex items-center justify-center will-change-[transform,opacity,filter]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-full w-full"
            aria-hidden
          >
            <path d={SOCIAL_ICONS.mail} />
          </svg>
        </span>
        <span
          data-email-icon="check"
          className="absolute inset-0 inline-flex items-center justify-center will-change-[transform,opacity,filter]"
          style={{ transform: "scale(0.25)", opacity: 0, filter: "blur(4px)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </span>
      <span className="sr-only">Copy email address</span>
    </button>
  );
}

export default function HeroSection() {
  return (
    <div className="flex w-full flex-col items-center md:items-start">
      {/* Logo, Name and Location */}
      <div className="mb-6 flex w-full items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-row items-center gap-6">
          <StaticLogo size={64} className="text-foreground shrink-0" />

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
            <div className="flex w-full items-center justify-between gap-3">
              <h1 className="text-foreground font-serif text-2xl font-normal tracking-tight whitespace-nowrap">
                {personalInfo.name}
              </h1>

              <div className="-my-1 flex shrink-0 items-center gap-1">
                <HeroSocialLink href={personalInfo.githubUrl} label="GitHub" icon="github" />
                <HeroSocialLink href={personalInfo.linkedinUrl} label="LinkedIn" icon="linkedin" />
                <HeroEmailButton email={personalInfo.email} />
              </div>
            </div>
            <address className="text-foreground/60 flex items-center gap-1 text-sm not-italic">
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
      </div>

      {/* Tagline */}
      <p className="text-foreground/80 mb-6 max-w-xl text-center text-sm md:text-left">
        {personalInfo.tagline}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-4 md:justify-start md:gap-8">
        <HeroActionLink href={personalInfo.cvUrl} badge="R" shortcut="r">
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
