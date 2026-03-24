// import { SectionBlock, SectionDivider, Badge } from "@/components/ui";
// import { blogPosts } from "@/lib/data";
import { SectionBlock } from "@/components/ui";

export default function BlogsPage() {
  return (
    <>
      <SectionBlock
        bottomDiamondsOnly={true}
        className="before:!left-0 before:!right-0"
      >
        <h1 className="text-foreground mb-4 font-serif text-2xl">Blogs</h1>
        <p className="text-foreground/80 text-sm leading-relaxed">
          Still in progress.
        </p>
      </SectionBlock>

      {/* <SectionDivider />

      <SectionBlock>
        <div className="flex flex-col">
          {blogPosts.map((post, index) => (
            <div key={post.slug}>
              {index > 0 && (
                <div className="border-accent/20 my-8 border-t border-dashed" />
              )}
              <article>
                <h2 className="text-foreground mb-2 font-serif text-base">
                  {post.title}
                </h2>
                <time className="text-foreground/50 mb-3 block font-mono text-xs">
                  {post.date}
                </time>
                <p className="text-foreground/70 mb-4 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </article>
            </div>
          ))}
        </div>
      </SectionBlock> */}
    </>
  );
}
