import { Panel, PageStack } from "@/components/ui";

export default function BlogsPage() {
  return (
    <PageStack>
      <Panel edges="bottom" ornaments="bottom">
        <h1 className="text-foreground mb-4 font-serif text-2xl">Blogs</h1>
        <p className="text-foreground/80 text-sm leading-relaxed">
          Still in progress.
        </p>
      </Panel>
    </PageStack>
  );
}
