import { MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import XeinLogo from "@/components/XeinLogo";
import { personalInfo } from "@/lib/data";
import { ICON_CONFIG } from "@/lib/config/design";

export default function HeroSection() {
  return (
    <>
      {/* Logo, Name and Location */}
      <div className="mb-6 flex items-center gap-8 [text-shadow:0px_1px_1.5px_rgba(0,0,0,0.16)]">
        <XeinLogo size={64} className="text-foreground shrink-0" />

        <div>
          <h1 className="text-foreground font-serif text-2xl font-normal tracking-tight">
            {personalInfo.name}
          </h1>
          <div className="text-foreground/70 my-1 flex items-center gap-1 text-sm">
            <MapPin
              size={ICON_CONFIG.sizes.sm}
              strokeWidth={ICON_CONFIG.strokeWidth}
            />
            <span>{personalInfo.location}</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-foreground/80 mb-6 max-w-xl text-sm">
        {personalInfo.tagline}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-8">
        <Button href={personalInfo.cvUrl} download badge="D">
          Download CV
        </Button>
        <Button href={personalInfo.calComUrl} badge="C">
          Schedule Call
        </Button>
      </div>
    </>
  );
}
