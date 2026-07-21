import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import rehypeImageGrid from "./src/lib/rehype-image-grid.mjs";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://xeind.net",
  output: "static",
  // Hover-triggered only: prefetching on viewport would re-download the
  // inlined CSS for every visible link's page — hover is intent.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
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
      filter: (page) => !page.endsWith("/badges/"),
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
