import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/instructors")({
  component: InstructorsPage,
});

function InstructorsPage() {
  return (
    <div className="flex flex-col">
      <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">Instructors</div>
    </div>
  );
}
