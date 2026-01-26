import HeroSection from "@/components/hero/HeroSection";
// Client-only lazy sections are placed in a client boundary component.
import {
  ProjectGrid,
  ExperienceTimeline,
  AboutSection,
} from "@/components/sections/LazySections";
import { SectionBlock, SectionDivider, CalloutLink } from "@/components/ui";
import { ArrowUpRight } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";

export default function Home() {
  return (
    <>
      <CalloutLink
        href="/art"
        label="Visit my Design Portfolio"
        icon={<ArrowUpRight size={16} strokeWidth={ICON_CONFIG.strokeWidth} />}
        external={true}
      />

      <SectionBlock
        showGrid={false}
        hideTopBorder={true}
        bottomDiamondsOnly={true}
      >
        <HeroSection />
      </SectionBlock>

      <SectionDivider />

      <SectionBlock>
        <AboutSection />
      </SectionBlock>

      <SectionDivider />

      <SectionBlock>
        <ExperienceTimeline />
      </SectionBlock>

      <SectionDivider />

      <SectionBlock>
        <ProjectGrid />
      </SectionBlock>

      {/* Spacer to reveal footer on scroll - matches footer height */}
      <div className="h-(--footer-height)" aria-hidden="true" />
    </>
  );
}
