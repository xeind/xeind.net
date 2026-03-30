import HeroSection from "@/components/hero/HeroSection";
import {
  ExperienceTimeline,
  ProjectGrid,
  AboutSection,
} from "@/components/sections/LazySections";
import { SectionBlock, SectionDivider } from "@/components/ui";
import CalloutLinkStatic from "@/components/ui/CalloutLinkStatic";
import { ArrowUpRight } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";

export default function Home() {
  return (
    <>
      <CalloutLinkStatic
        href="/blog"
        label="Visit my blog!"
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
