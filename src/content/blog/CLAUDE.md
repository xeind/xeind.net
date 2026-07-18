# Writing blog posts for xeind.net

This is Xein's personal blog. **One author, always.** Never add a byline, "By
Xein Deniel," author credit, or signature — the site already knows who wrote it.
The visible `By ...` line was removed from the post template on purpose; don't
reintroduce it in any form.

## Where a post lives

One folder per post: `src/content/blog/<slug>/index.mdx`. The folder name **is**
the URL slug (`/blog/<slug>`) — keep it short and kebab-case.

## Frontmatter

```yaml
---
title: "Sentence-case title, no trailing period"
date: 2026-07-18            # YYYY-MM-DD
excerpt: "One or two sentences. Concrete, not a summary — a hook."
tags: ["lowercase", "short", "specific"]
draft: true                # true while writing; flip to false to publish
# Optional, only for multi-part series:
# series: "series-slug"
# seriesOrder: 1
# seriesIcon: "star" | "terminal" | "keyboard"
---
```

- **Always start a new post as `draft: true`.** Drafts render in `npm run dev`
  but are excluded from the production build and the `/blog` index. Publish by
  changing it to `false` (auto-deploys on push).
- `excerpt` shows on the blog index and in social/SEO cards. Make it a hook with
  a specific detail, not "In this post I explain…".

## Voice

Match the existing posts (`hyper-key`, `nextjs-to-astro`). The through-line:

- **First person, personal, confident.** "I grew up on Windows." "I couldn't
  break past 95 on mobile." Start with a concrete personal hook or a specific
  number — never a throat-clear.
- **Short punchy sentences, mixed with longer explanatory ones.** Vary rhythm.
  One-line paragraphs are allowed and effective.
- **Specific over general.** Real numbers, real file names, real details ("My
  Caps Lock keycap is the shiniest key on the board"; "9,300 insertions,
  10,861 deletions across 98 files"). Cut adjectives, keep facts.
- **Honest, reflective closings.** End with what you learned or would do
  differently, not a recap. A single blockquote makes a good punchline.
- **No filler.** No "In today's fast-paced world," no "Let's dive in," no
  "In conclusion." If a sentence doesn't add a fact or move the story, delete it.

## Structure — this is the standard, not a suggestion

Every post follows the same skeleton. The existing posts (`hyper-key`,
`nextjs-to-astro`) are the reference; match them.

```mdx
---
# frontmatter
---

import { Cite, Ref, References } from "@/components/blog/MDXComponents";

Opening hook — one or two short paragraphs. No heading above it.

---

## First section

Body. Cite external claims inline.<Cite n={1} />

---

## Next section

...

---

[Closing link or line]

<References>
  <Ref n={1} href="https://…">What it is</Ref>
</References>
```

Rules that are **required**, because the last posts skipped them and it showed:

- **Use `---` between every major movement** — after the intro, and between
  sections. It's the visual rhythm of the site's posts. Don't run sections
  together.
- **Break paragraphs short.** One idea per paragraph. A single punchy line on
  its own is good. Don't write walls of text — the existing posts breathe.
- **Use citations for anything external.** Any tool, doc, video, product, or
  claim that has a source gets an inline `<Cite n={n} />` and a matching `<Ref>`
  in a `<References>` block at the end. Number them in order of appearance. This
  is not optional — if a post references outside things and has no `References`
  block, it's not done.
- `##` for section headings (short, direct: "The itch", "The Numbers"). Never
  `#` — the title renders it.
- Inline code liberally for anything technical: keys (`Caps Lock`), commands
  (`npm run dev`), configs, filenames, identifiers.
- Fenced code blocks with a language tag; highlighted via Shiki's
  `css-variables` theme (themed automatically, no per-block styling).
- Tables for comparisons (see the Next.js→Astro numbers table).
- `>` blockquotes for a landing-line or a quote — one per post, max, for impact.

## Images

Drop image files in the post's own folder and reference by **relative** path:

```md
![This alt text becomes the visible caption](./my-image.webp)
```

Local images colocated with the post (`src/content/blog/<slug>/`) are
processed through Astro's `astro:assets` pipeline automatically — the build
fingerprints the file, infers real `width`/`height` (so the page doesn't
shift while it loads), and serves it from `/_astro/` with a long-lived
immutable cache header. This only works for **relative** paths (`./…`); an
absolute `/blog/…` path or a `public/`-stored file is never optimized and
never gets dimensions. Don't use `public/` for post images.

Markdown images render through `MdxImg` automatically — you get a dashed
`accent/30` border (solid on hover), a centered capped width (`max-w-xl`, so
images are tidy figures, not full-bleed), and a click-to-zoom motion lightbox.
The alt text **is** the caption, so write it as one.

- **Prefer WebP.** Convert screenshots before committing — WebP runs ~60-70%
  smaller than PNG at the same visual quality for UI screenshots:
  `npx sharp -i original.png -o image.webp -- webp --quality 82` (or any
  equivalent — `sharp-cli` isn't a project dependency, so use whatever's on
  hand; the point is committing `.webp`, not the tool). Downscale retina
  captures (3000px+) to ~1840px wide first — the lightbox caps at 90vh
  anyway.
- Supported formats: png, jpg/jpeg, webp, avif, gif (animated GIFs animate in
  place and in the zoom).
- **Image grids (collages):** stack image lines back-to-back (no text between
  them) and they automatically become one FB/LinkedIn-style collage — 2 up to
  any count. Any paragraph of text between images splits the groups. Grids
  show at most 5 cells; extra images get a `+N` overlay on the fifth cell and
  remain reachable in the lightbox. Inside a grid, alt text is a11y/lightbox
  only (collage cells don't render captions). The lightbox gains next/prev
  chevrons, an `i / n` counter, and ←/→ keyboard navigation for grids.

  ```md
  ![first](./a.webp)
  ![second](./b.webp)
  ![third](./c.webp)
  ```

## MDX components

Import at the top of the file when used:

```mdx
import { Cite, Ref, References } from "@/components/blog/MDXComponents";
```

- **Citations**: inline `<Cite n={1} />` next to a claim, then a `<References>`
  block at the end with `<Ref n={1} href="…">source description</Ref>`. Use these
  when referencing external sources, docs, or videos — see `nextjs-to-astro`.
- **`PullQuoteCard`** is globally available (no import) for a testimonial-style
  standout; a plain `>` blockquote is usually better for your own punchlines.

## Before publishing

1. `npm run check` and `npm run build` pass.
2. Preview at `npm run dev` → `/blog/<slug>` and read it out loud in your voice.
3. Verify every external link resolves.
4. Flip `draft: true` → `false`.
