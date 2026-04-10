import { STACK_SPACING } from "@/lib/config/spacing";
import InlineIcon from "@/components/ui/InlineIcon";

export default function AboutSection() {
  return (
    <div className={STACK_SPACING.normal}>
      <h2 className="text-foreground font-serif text-2xl">About</h2>
      <div
        className={`text-foreground/80 ${STACK_SPACING.normal} text-sm leading-relaxed`}
      >
        <p>
          I&apos;m a full-stack engineer specializing in UI craft, motion, and
          microinteractions. Currently working at{" "}
          <a
            href="https://www.pioneerdev.ai/"
            target="_blank"
            rel="noopener noreferrer"
            data-hero-sfx="click"
            className="inline border-b border-dashed border-accent/30 pb-px text-accent transition-all hover:border-solid hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <InlineIcon src="/projects/pioneer.svg" />
            Pioneer
          </a>
          .
        </p>

        <p>
          I enjoy using{" "}
          <a
            href="https://github.com/xeind/dotfiles"
            target="_blank"
            rel="noopener noreferrer"
            title="my dotfiles"
            data-hero-sfx="click"
            className="inline border-b border-dashed border-accent/30 pb-px text-accent transition-all hover:border-solid hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            open‑source tools
          </a>{" "}
          and experiment with custom configs and self‑hosted environments to
          improve my developer workflow.
        </p>
      </div>
    </div>
  );
}
