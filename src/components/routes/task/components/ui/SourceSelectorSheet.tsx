import { Pecha } from "@/components/ui/shadimport";
import { useMemo, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import axiosInstance from "@/config/axios-config";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import SourceItem from "./sourceItem";
import pechaIcon from "@/assets/icon/pecha_icon.png";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";

export const fetchSegments = async (
  searchFilter: string,
  limit: number,
  skip: number,
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/search?query=${searchFilter}&search_type=${"SOURCE"}`,
    {
      params: {
        limit,
        skip,
      },
    },
  );
  return data;
};

interface SourceSelectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceContent: string) => void;
}

export const SourceSelectorSheet = ({
  isOpen,
  onOpenChange,
  onAddSource,
}: SourceSelectorSheetProps) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );
  const { data: searchData, isLoading } = useQuery({
    queryKey: [
      "topics",
      debouncedSearchFilter,
      pagination.currentPage,
      pagination.limit,
    ],
    queryFn: () => fetchSegments(debouncedSearchFilter, pagination.limit, skip),
    refetchOnWindowFocus: false,
  });
  const totalSegments = searchData?.total || 0;
  const totalPages = Math.ceil(totalSegments / pagination.limit);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };
  const { t } = useTranslate();

  const handleAddSource = (content: any) => {
    if (content) {
      onAddSource(content);
      onOpenChange(false);
    }
  };
  const sources = searchData?.sources || [];

  const renderSegmentList = () => {
    if (sources.length === 0) {
      return (
        <div className=" text-center h-full flex flex-col items-center justify-center">
          <img
            src={pechaIcon}
            alt="no data found"
            className="w-15 h-15 opacity-80"
          />
          <p>No data found</p>
          <span className="dark:text-[#b1b1b1] text-gray-600">
            Try adjusting your search terms
          </span>
        </div>
      );
    }
    return sources.map((source: any) => (
      <SourceItem source={source} onSegment={handleAddSource} />
    ));
  };
  return (
    <Pecha.Sheet open={isOpen} onOpenChange={onOpenChange}>
      <Pecha.SheetContent side="right" className="w-full sm:max-w-md">
        <Pecha.SheetHeader>
          <Pecha.SheetTitle>Add Source</Pecha.SheetTitle>
          <Pecha.SheetDescription>
            Search for a source to add to your task
          </Pecha.SheetDescription>
        </Pecha.SheetHeader>
        <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
        <div className="p-2">
          <div className="border w-full px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4" />
            <Pecha.Input
              placeholder={t("common.placeholder.search")}
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 space-y-4 border-y border-dashed border-gray-300 dark:border-input h-[540px] overflow-y-auto">
          {isLoading ? (
            <div className="w-full flex items-center justify-center h-full">
              <p>Loading segments...</p>
            </div>
          ) : (
            renderSegmentList()
          )}
        </div>
        {sources.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </Pecha.SheetContent>
    </Pecha.Sheet>
  );
};
