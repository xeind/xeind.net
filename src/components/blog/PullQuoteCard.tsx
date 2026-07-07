import { useId, type ReactNode } from "react";
import { CSS_TRANSITIONS } from "@/lib/config/animation";

interface PullQuoteCardProps {
  children: ReactNode;
  author: string;
  role?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  brand?: string;
  label?: string;
  href?: string;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PullQuoteCard({
  children,
  author,
  role,
  avatarSrc,
  avatarAlt,
  brand,
  label,
  href,
  className = "",
}: PullQuoteCardProps) {
  const patternId = useId().replace(/:/g, "");
  const initials = getInitials(author);

  const authorBlock = (
    <div className="min-w-0">
      <p className="text-foreground text-[0.8125rem] leading-none font-medium">
        {author}
      </p>
      {role ? (
        <p className="text-foreground/55 mt-1 font-mono text-[0.64rem] tracking-[0.18em] uppercase">
          {role}
        </p>
      ) : null}
    </div>
  );

  return (
    <figure
      className={`group relative my-8 overflow-hidden border border-dashed border-accent/25 bg-card p-5 sm:p-6 ${className}`}
    >
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
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-accent)_16%,transparent)_0%,color-mix(in_srgb,var(--color-accent)_9%,transparent)_38%,transparent_100%)]" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 size-full text-accent/45 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            x="-1"
            y="-1"
          >
            <path d="M0.5 10V0.5H10" fill="none" stroke="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {label ? (
              <p className="text-accent/70 mb-3 font-mono text-[0.65rem] tracking-[0.24em] uppercase">
                {label}
              </p>
            ) : null}
            {brand ? (
              <p className="text-secondary max-w-[18ch] font-serif text-2xl leading-none tracking-[-0.04em] sm:text-[2rem]">
                {brand}
              </p>
            ) : null}
          </div>
          <span className="text-accent/35 font-serif text-6xl leading-none">“</span>
        </div>

        <blockquote className="text-foreground/90 font-serif text-base leading-[1.9] tracking-[-0.01em] [hanging-punctuation:first_last] [text-wrap:pretty] [&_mark]:rounded-[2px] [&_mark]:bg-accent/15 [&_mark]:px-0.5 [&_mark]:py-px [&_mark]:text-foreground [&_mark]:not-italic [&_mark]:selection:bg-accent/30">
          {children}
        </blockquote>

        <figcaption className="mt-auto flex items-center gap-3">
          <span className="border-accent/25 bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden border border-dashed">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={avatarAlt ?? `${author} avatar`}
                loading="lazy"
                width={40}
                height={40}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-foreground/70 font-mono text-[0.72rem] tracking-[0.18em] uppercase">
                {initials}
              </span>
            )}
          </span>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-tertiary min-w-0 border-b border-dashed border-accent/30 pb-px transition-colors hover:border-solid"
            >
              {authorBlock}
            </a>
          ) : (
            authorBlock
          )}
        </figcaption>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.045] mix-blend-multiply dark:opacity-[0.02] dark:mix-blend-screen"
        style={{
          backgroundImage: "url(/noise.svg)",
          backgroundSize: "180px 180px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />
    </figure>
  );
}
