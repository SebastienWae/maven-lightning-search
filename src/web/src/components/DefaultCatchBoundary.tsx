import { SealWarningIcon } from "@phosphor-icons/react";
import { type ErrorComponentProps, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  if (import.meta.env.DEV) {
    console.error("DefaultCatchBoundary caught error:", error);
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <SealWarningIcon className="size-12" />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{error.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/" />} nativeButton={false}>
          Go Home
        </Button>
      </EmptyContent>
      {import.meta.env.DEV && (
        <pre className="mt-4 w-full max-w-2xl text-left text-xs text-muted-foreground bg-muted p-4 rounded-md overflow-auto max-h-64">
          {JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}
        </pre>
      )}
    </Empty>
  );
}
