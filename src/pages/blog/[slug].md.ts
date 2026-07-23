import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { absoluteUrl } from "@/lib/config/site";
import { mdxToPlainMarkdown } from "@/lib/markdown/mdx-plain";

// Plain-markdown twin of every published post at /blog/<slug>.md —
// fetchable text for curl, agents, and anyone who wants the words
// without the page.
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = (await getCollection("blog")).filter((post) => !post.data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const date = post.data.date.toISOString().slice(0, 10);

  const text = `# ${post.data.title}

By Xein Deniel · ${date} · ${absoluteUrl(`/blog/${post.id}`)}

${mdxToPlainMarkdown(post.body ?? "")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
