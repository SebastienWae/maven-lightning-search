import type { ReactNode } from "react";

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <div>
      <h1>NotFound</h1>
      {children || <p>The page you are looking for does not exist.</p>}
    </div>
  );
}
