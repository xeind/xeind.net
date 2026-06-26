import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
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
    shikiConfig: {
      theme: "css-variables",
    },
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
