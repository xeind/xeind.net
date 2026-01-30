import HeroSection from "@/components/hero/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";
// Keep ProjectGrid lazy-loaded (below-fold)
import { ProjectGrid } from "@/components/sections/LazySections";
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

      {/* <div className="h-(--footer-height)" aria-hidden="true" /> */}
    </>
  );
}
