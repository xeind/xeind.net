import ProjectGrid from "@/components/sections/ProjectGrid";
import HeroSection from "@/components/hero/HeroSection";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";
import AboutSection from "@/components/sections/AboutSection";
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

      <SectionDivider direction="right" />

      <SectionBlock>
        <AboutSection />
      </SectionBlock>

      <SectionDivider direction="left" />

      <SectionBlock>
        <ExperienceTimeline />
      </SectionBlock>

      <SectionDivider direction="right" />

      <SectionBlock>
        <ProjectGrid />
      </SectionBlock>

      {/* Spacer to reveal footer on scroll - matches footer height */}
      <div className="h-(--footer-height)" aria-hidden="true" />
    </>
  );
}
