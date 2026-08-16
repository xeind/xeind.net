import { CSS_TRANSITIONS } from "@/lib/config/animation";
import CornerDiamond from "@/components/ui/CornerDiamond";
import PretextBlock from "./PretextBlock";
import PullQuoteCard from "./PullQuoteCard";

/* ── Links ── */

function MdxLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href = "", children, ...rest } = props;
  const isExternal = href.startsWith("http") || href.startsWith("//");

  return (
    <a
      href={href}
      data-hero-sfx="click"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-accent hover:text-tertiary border-accent/30 focus-visible:ring-accent focus-visible:ring-offset-background inline border-b border-dashed pb-px font-normal transition-colors hover:border-solid focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={{
        ...CSS_TRANSITIONS.border,
        paddingBottom: "1px",
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ── Headings ── */

function MdxH1(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className="text-secondary mt-10 mb-4 font-serif text-2xl leading-8 [text-wrap:balance] first:mt-0"
      {...props}
    />
  );
}

function MdxH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className="text-secondary mt-8 mb-4 font-serif text-xl leading-8 [text-wrap:balance]"
      {...props}
    />
  );
}

function MdxH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className="text-secondary mt-6 mb-2 font-serif text-lg leading-6 [text-wrap:balance]"
      {...props}
    />
  );
}

/* ── Body ── */

function MdxParagraph(props: React.HTMLAttributes<HTMLParagraphElement>) {
  // If children is pure text (no inline elements like links, code, etc),
  // render through pretext for precise line-by-line layout
  const { children, ...rest } = props;

  if (typeof children === "string") {
    return (
      <div className="text-foreground/85 mb-6" {...rest}>
        <PretextBlock className="font-serif text-base">{children}</PretextBlock>
      </div>
    );
  }

  // Fall back to native rendering for paragraphs with inline elements
  return (
    <p
      className="text-foreground/85 mb-6 font-serif text-base leading-8 [text-wrap:pretty]"
      {...rest}
    >
      {children}
    </p>
  );
}

function MdxStrong(props: React.HTMLAttributes<HTMLElement>) {
  return <strong className="text-foreground font-medium" {...props} />;
}

function MdxEm(props: React.HTMLAttributes<HTMLElement>) {
  return <em className="italic" {...props} />;
}

/* ── Blockquote ── */

function MdxBlockquote(props: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote className="border-accent/30 my-6 border-l border-dashed py-2 pl-6" {...props}>
      <div className="text-foreground/60 font-serif text-base leading-8 italic">
        {props.children}
      </div>
    </blockquote>
  );
}

/* ── Code ── */

function MdxCode(props: React.HTMLAttributes<HTMLElement>) {
  const isCodeBlock = typeof props.children !== "string";

  if (isCodeBlock) {
    return <code {...props} />;
  }

  return (
    <code
      // leading-none: with an inherited 32px line-height, the mono font's
      // different baseline metrics push the line box to 33px; a collapsed
      // box rides inside the serif strut instead.
      className="border-accent/15 bg-muted text-foreground/80 border border-dashed px-1.5 py-0.5 font-mono text-[0.8125em] leading-none"
      {...props}
    />
  );
}

/* ── Divider ── */

function MdxHr() {
  // -mt-px: the rule's own pixel comes out of the 24px gap above it (every
  // MDX block carries a bottom margin for it to collapse against), so the
  // divider contributes exactly 48px of flow and the baselines below stay
  // on the half-cell.
  return (
    <div className="edge-glow-shell edge-glow-shell-horizontal relative -mx-4 -mt-px mb-6 h-px sm:-mx-8 md:-mx-16">
      {/* Full-bleed glow strip (like main's hairlines) — the dashed line
          extends ±9999px past the card, so its glow must too. A clipped
          .edge-glow-layer would go dark the moment the cursor leaves the
          card column. */}
      <div
        className="edge-glow-line absolute top-0 right-[-9999px] left-[-9999px] z-10 h-px"
        aria-hidden="true"
      />
      <div className="border-accent/20 absolute top-0 right-[-9999px] left-[-9999px] border-t border-dashed" />
      {/* The shell is -mx-16 at the cap, so these land on the sheet's rails,
          half over the paper. That is the frame case. */}
      <CornerDiamond position="tl" variant="frame" />
      <CornerDiamond position="tr" variant="frame" />
    </div>
  );
}

/* ── Lists ── */

function MdxUl(props: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className="text-foreground/85 mb-6 space-y-2 font-serif text-base leading-8" {...props} />
  );
}

function MdxOl(props: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className="text-foreground/85 mb-6 space-y-2 font-serif text-base leading-8 [counter-reset:list-counter]"
      {...props}
    />
  );
}

function MdxLi(props: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className="flex items-start gap-4" {...props}>
      {/* 32px line box: first-line centre sits at 16px, so the 4px dot tops
          out at 14px = 0.875em. */}
      <div className="bg-foreground/50 mt-[0.875em] h-1 w-1 shrink-0" />
      <span>{props.children}</span>
    </li>
  );
}

/* ── Image ── */

// Resolution to a final URL (and, for local images, a responsive
// srcSet/sizes pair via getImage()) happens upstream in MdxImage.astro —
// React components can't call Astro's async getImage() themselves. This
// component only renders whatever it's handed.
export interface MdxImgProps {
  src?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
  // Stamped by src/lib/markdown/rehype-image-grid.mjs on images grouped into a
  // collage — present means "render as a bare grid cell", absent means
  // "render as a captioned figure".
  "data-grid-index"?: string;
  "data-grid-total"?: string;
}

// Static markup only — MDX components rendered via the `components` prop are
// server-rendered and never hydrate, so interactivity lives in the vanilla
// /blog-lightbox.js (FLIP zoom-to-center), wired up in [slug].astro.
export function MdxImg(props: MdxImgProps) {
  const url = props.src || "";
  const { srcSet, sizes, width, height } = props;
  const alt = props.alt || "";
  const gridIndex = props["data-grid-index"];
  const gridTotal = props["data-grid-total"];

  if (gridIndex !== undefined && gridTotal !== undefined) {
    const index = Number(gridIndex);
    const total = Number(gridTotal);
    const visible = Math.min(total, 5);
    const extra = total - visible;
    const hidden = index >= visible;

    return (
      <button
        type="button"
        className={`blog-zoom blog-grid-cell focus-visible:ring-accent focus-visible:ring-offset-background relative cursor-zoom-in overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${hidden ? "hidden" : ""}`}
        data-zoom-src={url}
        data-zoom-alt={alt}
        aria-label={alt ? `Zoom image: ${alt}` : `Zoom image ${index + 1}`}
      >
        <img
          src={url}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {extra > 0 && index === visible - 1 && (
          <span
            className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 font-mono text-lg text-(--scrim-ink)"
            aria-hidden="true"
          >
            +{extra}
          </span>
        )}
      </button>
    );
  }

  // Snap the figure's rendered height to the 8px half-cell so the baselines
  // below it stay on the grid. At the max-w-xl cap the image box is 566px
  // wide (576 minus the mat's border and padding); round the height it
  // would have there to a multiple of 8, then give the mat's 2px of border
  // back (image = 8k − 2, mat padding + border = 10, total = 8k + 8).
  // Expressed as an aspect ratio it holds exactly at the cap and is merely
  // ≤4px cropped (object-cover) at any other width. Remote images without
  // dimensions keep their intrinsic ratio.
  const snappedHeight =
    width && height ? Math.round((566 * height) / width / 8) * 8 - 2 : undefined;

  return (
    <figure className="mx-auto my-6 max-w-xl">
      <button
        type="button"
        className="blog-zoom border-accent/30 bg-card group focus-visible:ring-accent focus-visible:ring-offset-background relative block w-full cursor-zoom-in border border-dashed p-1 transition-colors hover:border-solid focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        style={CSS_TRANSITIONS.border}
        data-zoom-src={url}
        data-zoom-alt={alt}
        aria-label={alt ? `Zoom image: ${alt}` : "Zoom image"}
      >
        <img
          src={url}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="block w-full object-cover"
          style={snappedHeight ? { aspectRatio: `566 / ${snappedHeight}` } : undefined}
        />
      </button>
      {alt && (
        <figcaption className="text-foreground/50 mt-2 text-center font-mono text-xs leading-4">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Image grid (collage) ── */

// Rendered for the custom <image-grid> element emitted by
// src/lib/markdown/rehype-image-grid.mjs when a post stacks >= 2 consecutive images.
// The children are the ORIGINAL <img> nodes (routed back through MdxImg,
// which renders them as bare cells because of the data-grid-* attrs the
// rehype plugin stamped on them) — this component just owns the grid shell.
// Static markup only — the lightbox (public/blog-lightbox.js) provides
// zoom + next/prev gallery navigation.
function ImageGrid({
  children,
  "data-count": dataCount,
}: {
  children?: React.ReactNode;
  "data-count"?: string;
}) {
  const count = Number(dataCount) || 0;
  if (count === 0) return null;
  const visible = Math.min(count, 5);

  return (
    <figure className="my-6">
      <div
        data-image-grid=""
        className={`blog-grid blog-grid-${visible} border-accent/30 bg-card border border-dashed p-1`}
      >
        {children}
      </div>
    </figure>
  );
}

/* ── Table ── */

function MdxTable(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 overflow-x-auto">
      {/* -mt-px absorbs the collapsed top border; the bottom one is the last
          row's own border, already inside the 40px row pitch. */}
      <table
        className="border-accent/20 -mt-px w-full border-collapse border border-dashed font-serif text-sm leading-6"
        {...props}
      />
    </div>
  );
}

function MdxTh(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      // pb is 8px minus the collapsed row border, so each row's pitch stays
      // a whole 40px instead of 41.
      className="border-accent/20 bg-muted text-foreground border border-dashed px-4 pt-2 pb-[7px] text-left font-mono text-xs leading-4 font-normal tracking-wide"
      {...props}
    />
  );
}

function MdxTd(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className="border-accent/20 text-foreground/80 border border-dashed px-4 pt-2 pb-[7px]"
      {...props}
    />
  );
}

/* ── References / Citations ── */

export function Cite({ n, href }: { n: number; href?: string }) {
  const anchor = href ?? `#ref-${n}`;
  return (
    <a
      href={anchor}
      // Raised with relative + leading-none, not align-super — super lifts
      // the whole 32px inline box and stretches the line to ~37px, which
      // knocks every baseline after it off the grid.
      className="text-accent hover:text-tertiary relative -top-[0.5em] ml-0.5 p-1 font-mono text-[0.65em] leading-none no-underline transition-colors"
    >
      [{n}]
    </a>
  );
}

export function Ref({
  n,
  href,
  children,
}: {
  n: number;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      id={`ref-${n}`}
      className="text-foreground/60 flex items-start gap-2 font-serif text-sm leading-6"
    >
      <span className="text-accent shrink-0 font-mono text-[0.7rem] leading-6">[{n}]</span>
      <span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/80 hover:text-tertiary font-normal no-underline transition-colors"
          >
            {children}
          </a>
        ) : (
          children
        )}
      </span>
    </li>
  );
}

export function References({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&_p]:mb-0 [&_p]:text-sm [&_p]:leading-6">
      <div className="border-accent/20 -mt-px mb-4 border-t border-dashed" />
      <h3 className="text-secondary mb-4 font-mono text-xs tracking-wide">REFERENCES</h3>
      <ol className="list-none space-y-2 pl-0">{children}</ol>
    </div>
  );
}

export { PullQuoteCard };

/* ── Video ── */

function MdxVideo(props: React.VideoHTMLAttributes<HTMLVideoElement>) {
  return (
    <video
      controls
      preload="metadata"
      className="border-accent/30 my-6 w-full border border-dashed"
      {...props}
    />
  );
}

/* ── Export ── */

export const mdxComponents = {
  a: MdxLink,
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  p: MdxParagraph,
  blockquote: MdxBlockquote,
  code: MdxCode,
  hr: MdxHr,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  strong: MdxStrong,
  em: MdxEm,
  img: MdxImg,
  "image-grid": ImageGrid,
  video: MdxVideo,
  table: MdxTable,
  th: MdxTh,
  td: MdxTd,
  PullQuoteCard,
};
