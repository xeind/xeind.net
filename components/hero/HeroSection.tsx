"use client";

import Button from "@/components/ui/Button";
import XeinLogo from "@/components/XeinLogo";
import { personalInfo } from "@/lib/data";
import { ICON_CONFIG } from "@/lib/config/design";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center md:items-start">
      {/* Logo, Name and Location */}
      <div className="mb-6 flex flex-row items-center gap-6">
        <XeinLogo size={64} className="text-foreground shrink-0" />

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
        <Button href={personalInfo.cvUrl} badge="V">
          View Resume
        </Button>
        <Button
          href={personalInfo.calComUrl || "https://cal.com/xeind"}
          target="_blank"
          rel="noopener noreferrer"
          badge="C"
        >
          Schedule Call
        </Button>
      </div>
    </div>
  );
}
