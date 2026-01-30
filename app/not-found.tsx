import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        {/* 404 Number - Monospace for technical feel */}
        <h1 className="text-foreground/60 mb-4 font-mono text-6xl font-bold tracking-tight">
          404
        </h1>

        {/* Title - Serif for elegance */}
        <h2 className="text-foreground mb-3 font-serif text-2xl">
          Page Not Found
        </h2>

        {/* Description - Sans for readability */}
        <p className="text-foreground/80 mb-8 text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back Home Link - Matches Button style */}
        <Link
          href="/"
          className="bg-card border-accent/30 text-foreground hover:border-accent/50 hover:bg-muted inline-flex items-center gap-2 border px-6 py-2 font-serif text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <ArrowLeft
            size={ICON_CONFIG.sizes.sm}
            strokeWidth={ICON_CONFIG.strokeWidth}
          />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
