import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE, absoluteUrl } from "@/lib/config/site";

// Plain-markdown twin of the blog index. Each entry points at the post's own
// .md rather than its HTML, so an agent that lands here can keep reading in
// the same format.
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const entries = posts
    .map((post) => {
      const date = post.data.date.toISOString().slice(0, 10);
      const tags = post.data.tags.length ? ` · ${post.data.tags.join(", ")}` : "";
      return `## ${post.data.title}\n\n${date}${tags}\n\n${post.data.excerpt}\n\nRead: ${SITE.url}/blog/${post.id}.md`;
    })
    .join("\n\n");

  const text = `# Writing by ${SITE.name}

${SITE.name} is a ${SITE.jobTitle} based in the ${SITE.location}.

Page: ${absoluteUrl("/blog")}
All posts in one fetch: ${SITE.url}/llms-full.txt

${entries}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
