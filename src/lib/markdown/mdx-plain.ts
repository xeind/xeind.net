/**
 * Convert a post's raw MDX body into plain readable markdown for the
 * text endpoints (/llms.txt, /llms-full.txt, /blog/<slug>.md).
 *
 * Not a real MDX parser — a small set of targeted rewrites for the
 * components this blog actually uses (Cite/Ref/References, images,
 * imports). Anything unrecognized falls through as-is.
 */
export function mdxToPlainMarkdown(body: string): string {
  let out = body;

  // import { A, B } from "..." — including multiline forms.
  out = out.replace(/^import\s[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

  // <Cite n={3} /> -> [3]
  out = out.replace(/<Cite\s+n=\{(\d+)\}\s*\/>/g, "[$1]");

  // <Ref n={1} href="URL">text</Ref> -> [1]: text — URL
  out = out.replace(
    /<Ref\s+n=\{(\d+)\}\s+href="([^"]+)"\s*>([\s\S]*?)<\/Ref>/g,
    (_m, n, href, text) => `[${n}]: ${text.replace(/\s+/g, " ").trim()} — ${href}`,
  );

  // <References>…</References> -> a References heading around the list.
  out = out.replace(/<References>/g, "## References\n");
  out = out.replace(/<\/References>/g, "");

  // Images point at build-time-resolved assets; keep just the caption.
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt) =>
    alt ? `[Image: ${alt}]` : "",
  );

  // Any remaining JSX component tags (capitalized): drop the tags, keep
  // inner content.
  out = out.replace(/<\/?[A-Z][a-zA-Z]*[^>]*>/g, "");

  // Reference lines keep their JSX source indentation — flush them left.
  out = out.replace(/^[ \t]+(\[\d+\]:)/gm, "$1");

  // Collapse the blank-line debris the removals leave behind.
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  return out;
}
