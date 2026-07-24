import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE, absoluteUrl } from "@/lib/config/site";

// llms.txt (https://llmstxt.org): a plain-text index of this site so
// agents and curl users can find the fetchable text versions of
// everything. Full content lives in /llms-full.txt and /blog/<slug>.md.
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const postLines = posts
    .map((post) => `- [${post.data.title}](${SITE.url}/blog/${post.id}.md): ${post.data.excerpt}`)
    .join("\n");

  const text = `# ${SITE.name}

> ${SITE.description} Based in ${SITE.location}. This file indexes the plain-text versions of the site's content.

## Blog

Each post is available as plain markdown at the .md URL:

${postLines}

## Everything in one fetch

- [llms-full.txt](${SITE.url}/llms-full.txt): all blog posts as plain markdown in a single file

## Elsewhere

- [Site](${absoluteUrl("/")})
- [RSS](${SITE.url}/rss.xml)
${SITE.profiles.map((p) => `- [${new URL(p).hostname.replace("www.", "")}](${p})`).join("\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
