import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE, absoluteUrl } from "@/lib/config/site";
import { projects } from "@/lib/data/projects";
import { experiences } from "@/lib/data/experience";
import { awards } from "@/lib/data/awards";

// Plain-markdown twin of the home page, advertised from its <head> via
// rel="alternate". Built from the same data modules the page renders — never
// a second copy of the prose, which would drift the first time either side is
// edited.
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const projectLines = projects
    .map((project) => {
      // Most projects carry a bare liveUrl and no projectLinks, so a twin
      // built from projectLinks alone silently drops their only address.
      const links = [
        ...(project.liveUrl ? [project.liveUrl] : []),
        ...(project.projectLinks ?? []).map((l) => `${l.label}: ${l.url}`),
      ].join(" · ");
      // Paragraph per entry, not a space-join: these lines don't all end in
      // punctuation, so joining them inline welds two sentences together.
      const detail = project.longDescription?.join("\n\n") ?? project.description;
      return [
        `### ${project.title} (${project.type}, ${project.year})`,
        detail,
        project.technologies.length ? `Built with: ${project.technologies.join(", ")}` : "",
        links,
      ]
        .filter(Boolean)
        .join("\n\n");
    })
    .join("\n\n");

  const experienceLines = experiences
    .map((job) => {
      const period = `${job.period.start} – ${job.period.end}`;
      const stack = job.technologies?.length ? `\n\nStack: ${job.technologies.join(", ")}` : "";
      return `### ${job.role}, ${job.company} (${period})\n\n${job.location}${job.companyUrl ? ` · ${job.companyUrl}` : ""}\n\n${job.description}${stack}`;
    })
    .join("\n\n");

  const awardLines = awards
    .map((award) => {
      const year = award.year ? ` (${award.year})` : "";
      return `- **${award.title}** — ${award.issuer}, ${award.type}${year}. ${award.description}`;
    })
    .join("\n");

  // SITE.description opens by restating the job title, which reads as a
  // stutter once the entity sentence has already said it. Take the tail when
  // it's there, fall back to the whole thing when the wording changes.
  const focus = SITE.description.split("specializing in ")[1] ?? SITE.description;

  const text = `# ${SITE.name}

${SITE.name} is a ${SITE.jobTitle.toLowerCase()} based in the ${SITE.location}, specializing in ${focus}

Site: ${absoluteUrl("/")}
Contact: ${SITE.email}

## Experience

${experienceLines}

## Projects

${projectLines}

## Recognition

${awardLines}

## Writing

${posts.map((post) => `- [${post.data.title}](${SITE.url}/blog/${post.id}.md): ${post.data.excerpt}`).join("\n")}

## Elsewhere

- Tools ${SITE.name} uses: ${SITE.url}/tools.md
${SITE.profiles.map((p) => `- ${new URL(p).hostname.replace("www.", "")}: ${p}`).join("\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
