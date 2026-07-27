import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "src/content/blog", pattern: "*/index.mdx" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Set when a post changes materially. Feeds dateModified in the article
    // schema — without it every post reads as untouched since publication.
    updated: z.coerce.date().optional(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    seriesIcon: z.enum(["star", "terminal", "keyboard"]).optional(),
  }),
});

export const collections = { blog };
