import { ArrowUpRightIcon, CalendarIcon, CheckCircleIcon, RecordIcon, StarIcon, UserIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { MultiSelectCombobox, type Option } from "@/components/MultiSelectCombobox";
import { SortableTableHead } from "@/components/SortableTableHead";
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
import {
  filterOptionsQueryOptions,
  type Talk,
  type TalksSearchParams,
  talksQueryOptions,
  talksSearchSchema,
} from "@/utils/talks";

type StatusValue = TalksSearchParams["status"][number];

const statusOptions: Option<StatusValue>[] = [
  { value: "scheduled", label: "Scheduled", icon: <CalendarIcon weight="fill" size={16} className="text-gray-300" /> },
  { value: "live", label: "Live", icon: <RecordIcon weight="fill" size={16} className="text-red-300" /> },
  {
    value: "recorded",
    label: "Recorded",
    icon: <CheckCircleIcon weight="fill" size={16} className="text-green-300" />,
  },
];

/**
 * Generate page numbers for pagination with ellipsis.
 * Returns array of page numbers or null (for ellipsis).
 * Standard pattern: [1, ..., current-1, current, current+1, ..., lastPage]
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];
  const siblings = 1;

  // Always include first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - siblings);
  const rangeEnd = Math.min(totalPages - 1, currentPage + siblings);

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push(null);
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push(null);
  }

  // Always include last page
  pages.push(totalPages);

  return pages;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const Route = createFileRoute("/_app/talks")({
  validateSearch: zodValidator(talksSearchSchema),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(talksQueryOptions(deps)),
      context.queryClient.ensureQueryData(filterOptionsQueryOptions()),
    ]);
  },
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
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const talksQuery = useSuspenseQuery(talksQueryOptions(searchParams));
  const filterOptionsQuery = useSuspenseQuery(filterOptionsQueryOptions());
  const { talks, total, page, totalPages } = talksQuery.data;
  const pageNumbers = getPageNumbers(page, totalPages);

  const tagOptions: Option[] = filterOptionsQuery.data.tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const instructorOptions: Option[] = filterOptionsQuery.data.instructors.map((inst) => ({
    value: inst.id,
    label: inst.name,
  }));

  const handleSort = (sortBy: "startTime" | "duration", sortOrder: "asc" | "desc") => {
    navigate({
      to: "/talks",
      search: (prev) => ({ ...prev, sortBy, sortOrder, page: 1 }),
    });
  };

  const handleStatusChange = (statuses: StatusValue[]) => {
    navigate({
      to: "/talks",
      search: (prev) => ({ ...prev, status: statuses, page: 1 }),
    });
  };

  const handleTagsChange = (tags: string[]) => {
    navigate({
      to: "/talks",
      search: (prev) => ({ ...prev, tags, page: 1 }),
    });
  };

  const handleInstructorsChange = (instructors: string[]) => {
    navigate({
      to: "/talks",
      search: (prev) => ({ ...prev, instructors, page: 1 }),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-dashed">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <SortableTableHead
                sortKey="startTime"
                currentSortBy={searchParams.sortBy}
                currentSortOrder={searchParams.sortOrder}
                onSort={handleSort}
              >
                Start Time
              </SortableTableHead>
              <SortableTableHead
                sortKey="duration"
                currentSortBy={searchParams.sortBy}
                currentSortOrder={searchParams.sortOrder}
                onSort={handleSort}
              >
                Duration
              </SortableTableHead>
              <TableHead className="p-0">
                <MultiSelectCombobox
                  label="Tags"
                  options={tagOptions}
                  selectedValues={searchParams.tags}
                  onSelectionChange={handleTagsChange}
                />
              </TableHead>
              <TableHead className="p-0">
                <MultiSelectCombobox
                  label="Instructors"
                  options={instructorOptions}
                  selectedValues={searchParams.instructors}
                  onSelectionChange={handleInstructorsChange}
                />
              </TableHead>
              <TableHead className="p-0">
                <MultiSelectCombobox
                  label="Status"
                  options={statusOptions}
                  selectedValues={searchParams.status}
                  onSelectionChange={handleStatusChange}
                />
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {talks.map((talk) => (
              <TableRow key={talk.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {talk.isFeatured && <StarIcon size={14} weight="fill" className="text-primary" />}
                    {talk.title}
                  </span>
                </TableCell>
                <TableCell className="max-w-xl">
                  <span className="whitespace-pre-line">{talk.description}</span>
                </TableCell>
                <TableCell>{formatDate(talk.startTime)}</TableCell>
                <TableCell>{talk.durationMin} min</TableCell>
                <TableCell className="w-32 min-w-32">
                  <div className="flex flex-wrap gap-1">
                    {talk.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const isSelected = searchParams.tags.includes(tag.id);
                          handleTagsChange(
                            isSelected
                              ? searchParams.tags.filter((id) => id !== tag.id)
                              : [...searchParams.tags, tag.id],
                          );
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="w-40 min-w-40">
                  <div className="flex flex-wrap gap-1">
                    {talk.instructors.map((instructor) => (
                      <Badge
                        key={instructor.id}
                        variant="outline"
                        className="h-auto py-1 cursor-pointer"
                        onClick={() => {
                          const isSelected = searchParams.instructors.includes(instructor.id);
                          handleInstructorsChange(
                            isSelected
                              ? searchParams.instructors.filter((id) => id !== instructor.id)
                              : [...searchParams.instructors, instructor.id],
                          );
                        }}
                      >
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
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={(e) => e.stopPropagation()}
                    render={<a href={`https://maven.com/p/${talk.slug}/`} target="_blank" rel="noopener noreferrer" />}
                    nativeButton={false}
                  >
                    <ArrowUpRightIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <div className="text-muted-foreground text-xs">{total} total results</div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Rows per page</span>
          <Select
            value={String(searchParams.limit)}
            onValueChange={(value) =>
              navigate({
                to: "/talks",
                search: (prev) => ({ ...prev, limit: Number(value), page: 1 }),
              })
            }
          >
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
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) {
                    navigate({
                      to: "/talks",
                      search: (prev) => ({ ...prev, page: page - 1 }),
                    });
                  }
                }}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {pageNumbers.map((pageNum, idx) => (
              <PaginationItem key={pageNum === null ? `ellipsis-${idx}` : pageNum}>
                {pageNum === null ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault();
                      navigate({
                        to: "/talks",
                        search: (prev) => ({ ...prev, page: pageNum }),
                      });
                    }}
                    isActive={pageNum === page}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) {
                    navigate({
                      to: "/talks",
                      search: (prev) => ({ ...prev, page: page + 1 }),
                    });
                  }
                }}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
