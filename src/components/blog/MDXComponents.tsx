import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CSS_TRANSITIONS } from "@/lib/config/animation";
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
      className="text-secondary mt-10 mb-4 font-serif text-2xl [text-wrap:balance] first:mt-0"
      {...props}
    />
  );
}

function MdxH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className="text-secondary mt-8 mb-3 font-serif text-xl [text-wrap:balance]"
      {...props}
    />
  );
}

function MdxH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className="text-secondary mt-6 mb-2 font-serif text-lg [text-wrap:balance]"
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
      <div className="text-foreground/85 mb-5" {...rest}>
        <PretextBlock className="font-serif text-base">{children}</PretextBlock>
      </div>
    );
  }

  // Fall back to native rendering for paragraphs with inline elements
  return (
    <p
      className="text-foreground/85 mb-5 font-serif text-base leading-[1.8] [text-wrap:pretty]"
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
    <blockquote
      className="border-accent/30 my-6 border-l border-dashed py-1 pl-5"
      {...props}
    >
      <div className="text-foreground/60 font-serif text-base leading-[1.8] italic">
        {props.children}
      </div>
    </blockquote>
  );
}

/* ── Code ── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="text-accent hover:text-tertiary absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[5px] transition-colors"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <div className="relative h-4 w-4">
        <AnimatePresence initial={false} mode="wait">
          {copied ? (
            <motion.svg
              key="check"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="absolute inset-0"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="absolute inset-0"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

function MdxPre(props: React.HTMLAttributes<HTMLPreElement>) {
  const { className: _className, style: _style, ...rest } = props;
  const childEl = props.children as React.ReactElement<{
    children?: React.ReactNode;
    className?: string;
  }> | null;
  const codeText =
    typeof childEl === "object" && childEl !== null && "props" in childEl
      ? String(childEl.props.children || "")
      : "";

  // Extract language from className (e.g. "astro-code" or "language-ts")
  const langClass =
    typeof childEl?.props?.className === "string"
      ? childEl.props.className
      : "";
  const langMatch = langClass.match(/language-(\w+)/);
  const lang = langMatch?.[1] ?? null;

  return (
    <div className="group relative my-4">
      {lang && (
        <span className="text-accent/50 absolute top-2.5 left-3.5 z-10 font-mono text-[0.65rem] tracking-wider uppercase select-none">
          {lang}
        </span>
      )}
      <CopyButton text={codeText.trim()} />
      <pre
        className={`border-accent/15 bg-muted overflow-x-auto border border-dashed font-mono text-[0.8125rem] leading-relaxed ${lang ? "pt-8 pr-4 pb-4 pl-4" : "p-4"}`}
        {...rest}
      />
    </div>
  );
}

function MdxCode(props: React.HTMLAttributes<HTMLElement>) {
  const isCodeBlock = typeof props.children !== "string";

  if (isCodeBlock) {
    return <code {...props} />;
  }

  return (
    <code
      className="border-accent/15 bg-muted text-foreground/80 border border-dashed px-1.5 py-0.5 font-mono text-[0.8125em]"
      {...props}
    />
  );
}

/* ── Divider ── */

function MdxHr() {
  return (
    <div className="edge-glow-shell edge-glow-shell-horizontal relative -mx-5 my-5 h-px sm:-mx-8 md:-mx-12">
      {/* Full-bleed glow strip (like main's hairlines) — the dashed line
          extends ±9999px past the card, so its glow must too. A clipped
          .edge-glow-layer would go dark the moment the cursor leaves the
          card column. */}
      <div
        className="edge-glow-line absolute top-0 right-[-9999px] left-[-9999px] z-10 h-px"
        aria-hidden="true"
      />
      <div className="border-accent/20 absolute top-0 right-[-9999px] left-[-9999px] border-t border-dashed" />
      <span className="edge-glow-node bg-card border-accent/20 absolute top-[-3.5px] left-[-4.5px] z-10 h-2 w-2 rotate-45 rounded-[1px] border" />
      <span className="edge-glow-node bg-card border-accent/20 absolute top-[-3.5px] right-[-4.5px] z-10 h-2 w-2 rotate-45 rounded-[1px] border" />
    </div>
  );
}

/* ── Lists ── */

function MdxUl(props: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className="text-foreground/85 mb-5 space-y-2 font-serif text-base leading-[1.8]"
      {...props}
    />
  );
}

function MdxOl(props: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className="text-foreground/85 mb-5 space-y-2 font-serif text-base leading-[1.8] [counter-reset:list-counter]"
      {...props}
    />
  );
}

function MdxLi(props: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className="flex items-start gap-3" {...props}>
      <div className="bg-foreground/50 mt-[0.72em] h-1 w-1 shrink-0" />
      <span>{props.children}</span>
    </li>
  );
}

/* ── Image ── */

// Local (src/-relative) markdown images are resolved by Astro's MDX image
// pipeline into an ImageMetadata object by the time they reach this
// component; public/-relative or remote images stay plain strings (never
// optimized, no known dimensions). Handle both.
type ResolvedImgSrc =
  | string
  | { src: string; width?: number; height?: number };

function resolveImgSrc(src: ResolvedImgSrc | undefined) {
  if (typeof src === "string") return { url: src };
  if (src && typeof src.src === "string") {
    return { url: src.src, width: src.width, height: src.height };
  }
  return { url: "" };
}

interface MdxImgProps {
  src?: ResolvedImgSrc;
  alt?: string;
  // Stamped by src/lib/rehype-image-grid.mjs on images grouped into a
  // collage — present means "render as a bare grid cell", absent means
  // "render as a captioned figure".
  "data-grid-index"?: string;
  "data-grid-total"?: string;
}

// Static markup only — MDX components rendered via the `components` prop are
// server-rendered and never hydrate, so interactivity lives in the vanilla
// /blog-lightbox.js (FLIP zoom-to-center), wired up in [slug].astro.
function MdxImg(props: MdxImgProps) {
  const { url, width, height } = resolveImgSrc(props.src);
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
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {extra > 0 && index === visible - 1 && (
          <span
            className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 font-mono text-lg text-[#EBE5D8]"
            aria-hidden="true"
          >
            +{extra}
          </span>
        )}
      </button>
    );
  }

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
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="block w-full"
        />
      </button>
      {alt && (
        <figcaption className="text-foreground/50 mt-2 text-center font-mono text-xs">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Image grid (collage) ── */

// Rendered for the custom <image-grid> element emitted by
// src/lib/rehype-image-grid.mjs when a post stacks >= 2 consecutive images.
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
      <table
        className="border-accent/20 w-full border-collapse border border-dashed font-serif text-sm"
        {...props}
      />
    </div>
  );
}

function MdxTh(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="border-accent/20 bg-muted text-foreground border border-dashed px-4 py-2 text-left font-mono text-xs font-normal tracking-wide"
      {...props}
    />
  );
}

function MdxTd(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className="border-accent/20 text-foreground/80 border border-dashed px-4 py-2"
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
      className="text-accent hover:text-tertiary ml-0.5 p-1 align-super font-mono text-[0.65em] no-underline transition-colors"
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
      className="text-foreground/60 flex items-start gap-2 font-serif text-sm leading-relaxed"
    >
      <span className="text-accent mt-px shrink-0 font-mono text-[0.7rem]">
        [{n}]
      </span>
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
    <div className="[&_p]:mb-0 [&_p]:text-sm [&_p]:leading-relaxed">
      <div className="border-accent/20 mb-4 border-t border-dashed" />
      <h3 className="text-secondary mb-3 font-mono text-xs tracking-wide">
        REFERENCES
      </h3>
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
