import type { APIRoute } from "astro";
import { SITE, absoluteUrl } from "@/lib/config/site";
import { toolCategories } from "@/lib/data/tools";

// Plain-markdown twin of /tools, from the same data the page renders.
export const GET: APIRoute = async () => {
  const sections = toolCategories
    .map((category) => {
      const items = category.tools
        .map((tool) => {
          const line = `- **${tool.name}** — ${tool.description}`;
          return tool.url ? `${line} (${tool.url})` : line;
        })
        .join("\n");
      return `## ${category.label}\n\n${items}`;
    })
    .join("\n\n");

  const text = `# Tools ${SITE.name} uses

Apps and tools ${SITE.name}, a ${SITE.jobTitle} based in the ${SITE.location}, uses for development, design, and productivity.

Page: ${absoluteUrl("/tools")}

${sections}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
