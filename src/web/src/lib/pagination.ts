export function getPageNumbers(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always return exactly 7 items for consistent layout
  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  if (!showLeftEllipsis) {
    // Near start: [1, 2, 3, 4, 5, ..., totalPages]
    return [1, 2, 3, 4, 5, null, totalPages];
  }

  if (!showRightEllipsis) {
    // Near end: [1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
    return [1, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // Middle: [1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages]
  return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
}
