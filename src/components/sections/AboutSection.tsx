import InlineIcon from "@/components/ui/InlineIcon";
import InlineLink from "@/components/ui/InlineLink";
import pioneerIcon from "@/assets/pioneer.svg";

const inlineLinkClass =
  "inline border-b border-dashed border-accent/30 pb-px text-accent transition-all hover:border-solid hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function AboutSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-foreground font-serif text-2xl font-bold">About</h2>
      <div className="text-foreground/80 space-y-4 text-sm leading-relaxed">
        <p>
          I&apos;m a full-stack engineer specializing in UI craft, motion, and microinteractions.
          Currently working at{" "}
          <a
            href="https://www.pioneerdev.ai/"
            target="_blank"
            rel="noopener noreferrer"
            data-hero-sfx="click"
            className={inlineLinkClass}
          >
            <InlineIcon src={pioneerIcon.src} className="mr-[0.175rem] ml-[0.175rem]" />
            Pioneer
          </a>
          .
        </p>

        <p>
          I enjoy using{" "}
          <InlineLink href="https://github.com/xeind/dotfiles" external hintLabel="my dotfiles">
            open‑source tools
          </InlineLink>{" "}
          and experiment with custom configs and self‑hosted environments to improve my developer
          workflow.
        </p>
      </div>
    </div>
  );
}
