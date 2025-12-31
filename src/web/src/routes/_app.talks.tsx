import { ArrowUpRightIcon, CalendarIcon, CheckCircleIcon, RecordIcon, StarIcon, UserIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Talk = {
  id: string;
  title: string;
  description: string;
  isFeatured: boolean;
  status: "Scheduled" | "Live" | "Recorded";
  startTime: Date;
  durationMin: number;
  numSignups: number;
  tags: { id: string; name: string }[];
  instructors: { id: string; name: string; imageUrl: string }[];
};

const fakeTalks: Talk[] = [
  {
    id: "1",
    title: "Introduction to React Server Components",
    description:
      "Learn the fundamentals of React Server Components and how they change the way we build React applications. We'll cover the mental model, when to use server vs client components, and best practices for data fetching. This session includes hands-on exercises and real-world examples from production applications.",
    isFeatured: true,
    status: "Recorded",
    startTime: new Date("2025-02-15T14:00:00"),
    durationMin: 60,
    numSignups: 342,
    tags: [
      { id: "t1", name: "React" },
      { id: "t2", name: "Frontend" },
    ],
    instructors: [
      {
        id: "i1",
        name: "Sarah Chen",
        imageUrl: "https://i.pravatar.cc/150?u=sarah",
      },
    ],
  },
  {
    id: "2",
    title: "Building Type-Safe APIs with tRPC",
    description:
      "Discover how tRPC enables end-to-end type safety between your frontend and backend without code generation. We'll build a full-stack application from scratch.",
    isFeatured: false,
    status: "Live",
    startTime: new Date("2025-02-18T10:00:00"),
    durationMin: 45,
    numSignups: 189,
    tags: [
      { id: "t3", name: "TypeScript" },
      { id: "t4", name: "API" },
      { id: "t5", name: "Full-Stack" },
    ],
    instructors: [
      {
        id: "i2",
        name: "Marcus Johnson",
        imageUrl: "https://i.pravatar.cc/150?u=marcus",
      },
      {
        id: "i3",
        name: "Elena Rodriguez",
        imageUrl: "https://i.pravatar.cc/150?u=elena",
      },
    ],
  },
  {
    id: "3",
    title: "Advanced CSS Grid Layouts",
    description:
      "Master CSS Grid with advanced techniques including subgrid, auto-placement algorithms, and responsive layouts without media queries. This workshop dives deep into the grid specification and shows you patterns that will transform how you approach layout challenges. We'll examine real-world case studies and rebuild complex layouts step by step.",
    isFeatured: true,
    status: "Scheduled",
    startTime: new Date("2025-02-20T16:00:00"),
    durationMin: 90,
    numSignups: 256,
    tags: [
      { id: "t6", name: "CSS" },
      { id: "t2", name: "Frontend" },
    ],
    instructors: [
      {
        id: "i4",
        name: "Alex Kim",
        imageUrl: "https://i.pravatar.cc/150?u=alex",
      },
    ],
  },
  {
    id: "4",
    title: "Database Performance Optimization",
    description:
      "Learn to identify and fix database bottlenecks. Covers indexing strategies, query optimization, and monitoring tools.",
    isFeatured: false,
    status: "Scheduled",
    startTime: new Date("2025-02-22T09:00:00"),
    durationMin: 75,
    numSignups: 128,
    tags: [
      { id: "t7", name: "Database" },
      { id: "t8", name: "Performance" },
      { id: "t9", name: "Backend" },
    ],
    instructors: [
      {
        id: "i5",
        name: "David Park",
        imageUrl: "https://i.pravatar.cc/150?u=david",
      },
    ],
  },
  {
    id: "5",
    title: "Testing React Applications",
    description:
      "A comprehensive guide to testing React apps with Vitest and React Testing Library. Learn unit testing, integration testing, and how to write tests that give you confidence without slowing you down. We'll cover mocking, async testing patterns, and strategies for testing complex UI interactions.",
    isFeatured: false,
    status: "Recorded",
    startTime: new Date("2025-02-25T13:00:00"),
    durationMin: 60,
    numSignups: 201,
    tags: [
      { id: "t1", name: "React" },
      { id: "t10", name: "Testing" },
    ],
    instructors: [
      {
        id: "i6",
        name: "Jessica Liu",
        imageUrl: "https://i.pravatar.cc/150?u=jessica",
      },
      {
        id: "i7",
        name: "Ryan Murphy",
        imageUrl: "https://i.pravatar.cc/150?u=ryan",
      },
    ],
  },
  {
    id: "6",
    title: "Kubernetes for Developers",
    description:
      "Get started with Kubernetes without the ops complexity. Perfect for developers who want to understand container orchestration.",
    isFeatured: true,
    status: "Live",
    startTime: new Date("2025-02-28T11:00:00"),
    durationMin: 120,
    numSignups: 315,
    tags: [
      { id: "t11", name: "DevOps" },
      { id: "t12", name: "Kubernetes" },
      { id: "t13", name: "Containers" },
    ],
    instructors: [
      {
        id: "i8",
        name: "Chris Anderson",
        imageUrl: "https://i.pravatar.cc/150?u=chris",
      },
    ],
  },
  {
    id: "7",
    title: "State Management in 2025",
    description:
      "Compare modern state management solutions: Zustand, Jotai, Valtio, and the built-in React APIs. Learn when to use each and how to migrate between them. This talk cuts through the hype and gives you practical guidance based on real-world project requirements and team dynamics.",
    isFeatured: false,
    status: "Scheduled",
    startTime: new Date("2025-03-02T15:00:00"),
    durationMin: 45,
    numSignups: 178,
    tags: [
      { id: "t1", name: "React" },
      { id: "t14", name: "State Management" },
    ],
    instructors: [
      {
        id: "i1",
        name: "Sarah Chen",
        imageUrl: "https://i.pravatar.cc/150?u=sarah",
      },
    ],
  },
];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const Route = createFileRoute("/_app/talks")({
  component: TalksPage,
});

function StatusBadge({ status }: { status: Talk["status"] }) {
  switch (status) {
    case "Scheduled":
      return (
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon weight="fill" size={16} className="text-gray-300" />
          {status}
        </span>
      );
    case "Live":
      return (
        <span className="inline-flex items-center gap-1.5">
          <RecordIcon size={16} weight="fill" className="text-red-300" />
          {status}
        </span>
      );
    case "Recorded":
      return (
        <span className="inline-flex items-center gap-1.5">
          <CheckCircleIcon size={16} weight="fill" className="text-green-300" />
          {status}
        </span>
      );
  }
}

function TalksPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-dashed">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Instructors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fakeTalks.map((talk) => (
              <TableRow key={talk.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {talk.isFeatured && <StarIcon size={14} weight="fill" className="text-primary" />}
                    {talk.title}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <span className="whitespace-normal">{talk.description}</span>
                </TableCell>
                <TableCell>{formatDate(talk.startTime)}</TableCell>
                <TableCell>{talk.durationMin} min</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {talk.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {talk.instructors.map((instructor) => (
                      <Badge key={instructor.id} variant="outline" className="h-auto py-1">
                        <Avatar size="sm">
                          <AvatarImage src={instructor.imageUrl} />
                          <AvatarFallback>
                            <UserIcon />
                          </AvatarFallback>
                        </Avatar>
                        {instructor.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={talk.status} />
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="xs">
                    <ArrowUpRightIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Rows per page</span>
          <Select defaultValue="10">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
