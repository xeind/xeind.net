import Panel from "@/components/ui/Panel";
import PageStack from "@/components/ui/PageStack";

export default function BlogsPage() {
  return (
    <PageStack>
      <Panel edges="both" ornaments="bottom">
        <h1 className="text-foreground mb-4 font-serif text-2xl">Blogs</h1>
        <p className="text-foreground/80 text-sm leading-relaxed">
          Still in progress.
        </p>
      </Panel>
    </PageStack>
  );
}
