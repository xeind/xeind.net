import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import rehypeImageGrid from "./src/lib/markdown/rehype-image-grid.mjs";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";

// lastmod for the sitemap, read straight from post frontmatter. The content
// collection is not available in this file, and the two dates are plain
// `key: YYYY-MM-DD` lines, so a line match is enough. `updated` wins over
// `date`; /blog/ takes the newest of them. Home and /tools/ carry no lastmod
// rather than a build date that would claim a change on every deploy.
const blogDir = fileURLToPath(new URL("./src/content/blog", import.meta.url));
const postLastmod = new Map();
for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const source = readFileSync(`${blogDir}/${slug}/index.mdx`, "utf8");
  const date = source.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
  const updated = source.match(/^updated:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (date) postLastmod.set(slug, new Date(updated ?? date));
}
const blogLastmod = [...postLastmod.values()].sort((a, b) => b - a)[0];

export default defineConfig({
  site: "https://xeind.net",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  build: {
    inlineStylesheets: "always",
  },
  markdown: {
    // Astro 7 made Satteri the default processor. rehype-image-grid is a hast
    // plugin, so the blog stays on unified until (if ever) it is ported.
    processor: unified({
      rehypePlugins: [rehypeImageGrid],
    }),
    shikiConfig: {
      theme: "css-variables",
    },
  },
  image: {
    // Applies to Markdown/MDX `![]()` images (blog posts) — generates
    // srcset/sizes so devices fetch a size matched to the figure's
    // actual display width instead of the full source resolution.
    layout: "constrained",
    responsiveStyles: true,
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      // Only indexable routes belong here. /design is noindex, so listing it
      // asks crawlers to fetch a page that then tells them to drop it.
      filter: (page) =>
        !page.endsWith("/badges/") && !page.endsWith("/design/") && !page.endsWith("/lab/"),
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === "/blog/") item.lastmod = blogLastmod;
        const slug = path.match(/^\/blog\/([^/]+)\/$/)?.[1];
        if (slug && postLastmod.has(slug)) item.lastmod = postLastmod.get(slug);
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
