import type { Metadata } from "next";
import { Panel, InlineLink, PageStack } from "@/components/ui";
import { toolCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Apps and tools I use for development, design, and productivity.",
};

export default function ToolsPage() {
  return (
    <PageStack>
      <Panel edges="bottom" ornaments="bottom">
        <h1 className="text-foreground mb-8 font-serif text-2xl">Tools</h1>

        <div className="flex flex-col">
          {toolCategories.map((category, index) => (
            <div key={category.label}>
              {index > 0 && (
                <div className="border-accent/20 my-6 border-t border-dashed" />
              )}
              <div>
                <h2 className="text-accent mb-3 font-mono text-xs tracking-wide">
                  {category.label}
                </h2>
                <ul className="space-y-1">
                  {category.tools.map((tool) => (
                    <li
                      key={tool.name}
                      className="text-foreground/80 text-sm leading-relaxed"
                    >
                      {tool.url ? (
                        <InlineLink href={tool.url} external>
                          {tool.name}
                        </InlineLink>
                      ) : (
                        <span className="text-foreground">{tool.name}</span>
                      )}
                      <span className="text-foreground/50">
                        {" "}
                        &mdash; {tool.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </PageStack>
  );
}
