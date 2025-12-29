import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/talks")({
  component: TalksPage,
});

function TalksPage() {
  return (
    <div className="flex flex-col">
      <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">Talks</div>
    </div>
  );
}
