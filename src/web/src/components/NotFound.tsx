import { LinkBreakIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <LinkBreakIcon className="size-12" />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>{children || "The page you are looking for does not exist."}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/" />}>Go Home</Button>
      </EmptyContent>
    </Empty>
  );
}
