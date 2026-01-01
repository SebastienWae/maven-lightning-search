import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortOrder = "asc" | "desc";

type SortableTableHeadProps<T extends string> = {
  sortKey: T;
  currentSortBy: T;
  currentSortOrder: SortOrder;
  onSort: (sortBy: T, sortOrder: SortOrder) => void;
  children: React.ReactNode;
  className?: string;
};

export function SortableTableHead<T extends string>({
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  children,
  className,
}: SortableTableHeadProps<T>) {
  const isActive = sortKey === currentSortBy;

  const handleClick = () => {
    if (isActive) {
      onSort(sortKey, currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(sortKey, "desc");
    }
  };

  const Icon = isActive ? (currentSortOrder === "asc" ? CaretUpIcon : CaretDownIcon) : CaretUpDownIcon;

  return (
    <TableHead className={cn("cursor-pointer select-none", className)} onClick={handleClick}>
      <span className="inline-flex items-center gap-1">
        {children}
        <Icon size={14} />
      </span>
    </TableHead>
  );
}
