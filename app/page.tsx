import HeroSection from "@/components/hero/HeroSection";
import {
  ExperienceTimeline,
  ProjectGrid,
  AboutSection,
} from "@/components/sections/LazySections";
import { Panel, PageStack, CalloutBand } from "@/components/ui";
import { ArrowUpRight } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";

export default function Home() {
  return (
    <PageStack
      lead={
        <CalloutBand
          href="/blog"
          label="Visit my blog!"
          icon={
            <ArrowUpRight size={16} strokeWidth={ICON_CONFIG.strokeWidth} />
          }
          external={true}
        />
      }
    >
      <Panel tone="hero" padding="lg" edges="bottom" ornaments="bottom">
        <HeroSection />
      </Panel>

      <Panel>
        <AboutSection />
      </Panel>

      <Panel>
        <ExperienceTimeline />
      </Panel>

      <Panel>
        <ProjectGrid />
      </Panel>

      {/* <div className="h-(--footer-height)" aria-hidden="true" /> */}
    </PageStack>
  );
}
