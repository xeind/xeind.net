"use client";

import { STACK_SPACING } from "@/lib/config/spacing";
import InlineLink from "@/components/ui/InlineLink";

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
          <InlineLink href="https://www.pioneerdev.ai/" external>
            Pioneer
          </InlineLink>
          .
        </p>

        <p>
          I enjoy using open‑source tools and experiment with custom configs and
          self‑hosted environments to improve my developer workflow.
        </p>
      </div>
    </div>
  );
}
