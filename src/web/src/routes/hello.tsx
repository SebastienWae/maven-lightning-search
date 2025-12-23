import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hello")({
  component: Hello,
});

function Hello() {
  return <div>hello</div>;
}
