import Badge from "@/components/ui/Badge";
import SectionBlock from "@/components/ui/SectionBlock";

export default function BadgeDemo() {
  return (
    <SectionBlock>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground mb-6 font-serif text-2xl font-bold">
            Badge Component Demo
          </h1>
        </div>

        {/* Default Variant */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Default Variant
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge>TypeScript</Badge>
            <Badge>React</Badge>
            <Badge>Next.js</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>PostgreSQL</Badge>
            <Badge>Node.js</Badge>
          </div>
        </div>

        {/* Accent Variant */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Accent Variant (emphasized)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Featured</Badge>
            <Badge variant="accent">New</Badge>
            <Badge variant="accent">Popular</Badge>
            <Badge variant="accent">Primary Tech</Badge>
          </div>
        </div>

        {/* Muted Variant */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Muted Variant (subtle)
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted">2024</Badge>
            <Badge variant="muted">In Progress</Badge>
            <Badge variant="muted">Archive</Badge>
            <Badge variant="muted">Draft</Badge>
          </div>
        </div>

        {/* Mixed Usage Example */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Mixed Usage (Real Project Example)
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent">Featured</Badge>
              <Badge variant="muted">2024</Badge>
            </div>
            <p className="text-foreground/80 text-sm">
              E-commerce platform built with modern web technologies
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>TypeScript</Badge>
              <Badge>React</Badge>
              <Badge>Next.js</Badge>
              <Badge>Prisma</Badge>
              <Badge>tRPC</Badge>
              <Badge>Tailwind</Badge>
            </div>
          </div>
        </div>

        {/* Inline Code Example */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Inline Code Styling
          </h2>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Run <code>npm install</code> to install dependencies, then use{" "}
            <code>npm run dev</code> to start the development server. You can
            also try <code>bun dev</code> for faster startup times.
          </p>
        </div>

        {/* Size Comparison */}
        <div>
          <h2 className="text-foreground mb-3 font-serif text-lg">
            Design Details
          </h2>
          <div className="text-foreground/70 space-y-2 text-sm">
            <p>✓ Dashed borders (matches button/link aesthetic)</p>
            <p>✓ Monospace font (Commit Mono - technical feel)</p>
            <p>✓ Hover states (subtle brightness increase)</p>
            <p>✓ Consistent 200ms transitions</p>
            <p>✓ Theme-aware colors (works across all 7 themes)</p>
          </div>
        </div>
      </div>
    </SectionBlock>
  );
}
