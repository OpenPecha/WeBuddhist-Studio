import { Pecha } from "@/components/ui/shadimport";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  return (
    <Pecha.Pagination className={"mt-4 " + className}>
      <Pecha.PaginationPrevious
        onClick={(e) => {
          e.preventDefault();
          onPageChange(Math.max(1, currentPage - 1));
        }}
        className={
          currentPage === 1
            ? "pointer-events-none opacity-50"
            : "cursor-pointer"
        }
      />
      <Pecha.PaginationContent className="mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Pecha.PaginationItem key={pageNum}>
            <Pecha.PaginationLink
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPageChange(pageNum);
              }}
              className={
                currentPage === pageNum
                  ? "bg-primary text-white dark:bg-primary/10"
                  : "cursor-pointer"
              }
            >
              {pageNum}
            </Pecha.PaginationLink>
          </Pecha.PaginationItem>
        ))}
      </Pecha.PaginationContent>
      <Pecha.PaginationNext
        onClick={(e) => {
          e.preventDefault();
          onPageChange(Math.min(totalPages, currentPage + 1));
        }}
        className={
          currentPage === totalPages
            ? "pointer-events-none opacity-50"
            : "cursor-pointer"
        }
      />
    </Pecha.Pagination>
  );
};
