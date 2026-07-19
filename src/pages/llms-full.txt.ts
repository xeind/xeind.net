import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE } from "@/config/site";
import { mdxToPlainMarkdown } from "@/lib/mdx-plain";

// The whole blog as one plain-markdown file — the "just give me the
// text" endpoint referenced from /llms.txt.
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const sections = posts.map((post) => {
    const date = post.data.date.toISOString().slice(0, 10);
    return `# ${post.data.title}

By ${SITE.name} · ${date} · ${SITE.url}/blog/${post.id}

${mdxToPlainMarkdown(post.body ?? "")}`;
  });

  const text = `${SITE.name} — ${SITE.url}
${SITE.description}

All blog posts, newest first.

---

${sections.join("\n\n---\n\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
