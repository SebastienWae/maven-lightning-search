import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  console.error(error);
  return (
    <div>
      <h1>DefaultCatchBoundary</h1>
      <p>{error.message}</p>
    </div>
  );
}
