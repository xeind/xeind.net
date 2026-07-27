import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import rehypeImageGrid from "./src/lib/markdown/rehype-image-grid.mjs";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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
    rehypePlugins: [rehypeImageGrid],
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
      filter: (page) => !page.endsWith("/badges/") && !page.endsWith("/design/"),
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
