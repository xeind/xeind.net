"use client";

import { STACK_SPACING } from "@/lib/config/spacing";

/**
 * ExperienceSkeleton - Loading placeholder for ExperienceTimeline
 *
 * Matches the visual structure:
 * - Timeline vertical line on left
 * - Timeline node/dot
 * - Company name, role, date
 * - Description paragraph
 * - Tech badges
 */
export default function ExperienceSkeleton() {
  return (
    <div className={STACK_SPACING.normal}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="group relative mb-8 flex gap-6 last:mb-0">
          {/* Timeline column */}
          <div className="relative flex flex-col items-center">
            {/* Vertical line - dashed default */}
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-foreground/30" />

            {/* Timeline node */}
            <div className="relative z-10 mt-1.5">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" />
            </div>
          </div>

          {/* Content column */}
          <div className="flex-1 pb-8">
            {/* Header: Company + Role */}
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>

            {/* Date */}
            <div className="mb-3 h-3 w-20 animate-pulse rounded bg-muted" />

            {/* Description */}
            <div className="mb-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-5 w-16 animate-pulse rounded border border-dashed border-muted bg-muted/50"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
