export default function ArtPage() {
  return (
    <div className="container mx-auto px-6 py-12 sm:px-12 sm:py-24">
      <div className="bg-card ring-border relative p-6 ring-1 sm:p-12">
        {/* Title - Serif for elegance (matches other section headings) */}
        <h1 className="text-foreground mb-6 font-serif text-2xl">
          Art & Design
        </h1>

        {/* Description - Sans for readability */}
        <p className="text-foreground/80 leading-relaxed">
          Visual explorations, design experiments, and creative work.
        </p>

        {/* Status - Mono for technical feel */}
        <p className="text-foreground/60 mt-8 font-mono text-sm">
          Coming soon...
        </p>
      </div>
    </div>
  );
}
