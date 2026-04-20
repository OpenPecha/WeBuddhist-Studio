import { Pecha } from "@/components/ui/shadimport";
import { useEffect, useMemo, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import { useDebounce } from "use-debounce";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import SourceItem from "./sourceItem";
import pechaIcon from "@/assets/icon/pecha_icon.png";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import SelectedSourceDetail from "./SourceDetail";
import {
  searchSources,
  searchTitles,
  fetchTextDetails,
} from "@/components/api/searchApi";
import { flattenSegments, getLastSegmentId } from "@/lib/utils";
import type { SourceData } from "./SourceDetail";

interface SourceSelectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceData: SourceData) => void;
}

export const SourceSelectorSheet = ({
  isOpen,
  onOpenChange,
  onAddSource,
}: SourceSelectorSheetProps) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const [searchOnlyTitles, setSearchOnlyTitles] = useState(true);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const { t } = useTranslate();

  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );

  const { data: multilingualData, isLoading: isMultilingualLoading } = useQuery(
    {
      queryKey: [
        "topics",
        debouncedSearchFilter,
        pagination.currentPage,
        pagination.limit,
      ],
      queryFn: () =>
        searchSources({
          query: debouncedSearchFilter,
          limit: pagination.limit,
          skip,
        }),
      refetchOnWindowFocus: false,
      enabled: isOpen && !searchOnlyTitles && debouncedSearchFilter.length > 0,
    },
  );

  const { data: titleData, isLoading: isTitleLoading } = useQuery({
    queryKey: [
      "titleSearch",
      debouncedSearchFilter,
      pagination.currentPage,
      pagination.limit,
    ],
    queryFn: () =>
      searchTitles({
        title: debouncedSearchFilter,
        limit: pagination.limit,
        offset: skip,
      }),
    refetchOnWindowFocus: false,
    enabled: isOpen && searchOnlyTitles && debouncedSearchFilter.length > 0,
  });

  const {
    data: detailsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["textDetails", selectedSource?.id],
    initialPageParam: undefined as
      | { segmentId: string; direction: "next" | "previous" }
      | undefined,
    queryFn: ({ pageParam }) =>
      fetchTextDetails({
        textId: selectedSource.id,
        segmentId: pageParam?.segmentId,
        direction: pageParam?.direction as "next" | "previous" | undefined,
        size: 20,
      }),
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.current_segment_position >= lastPage?.total_segments)
        return undefined;
      const lastSegmentId = getLastSegmentId(lastPage.content.sections);
      if (!lastSegmentId) return undefined;
      return { segmentId: lastSegmentId, direction: "next" };
    },
    enabled: !!selectedSource?.id && searchOnlyTitles,
    refetchOnWindowFocus: false,
  });

  const { ref: bottomSentinelRef, inView: isBottomVisible } = useInView({
    threshold: 0.1,
    rootMargin: "50px",
  });

  useEffect(() => {
    if (isBottomVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const detailSegments = useMemo(() => {
    if (!detailsData?.pages) return [];
    const allSegments = detailsData.pages.flatMap((page) =>
      flattenSegments(page.content.sections),
    );
    return Array.from(
      new Map(allSegments.map((s: any) => [s.segment_id, s])).values(),
    );
  }, [detailsData?.pages]);

  const isLoading = searchOnlyTitles ? isTitleLoading : isMultilingualLoading;

  const sources = searchOnlyTitles
    ? titleData || []
    : multilingualData?.sources || [];

  const segments = searchOnlyTitles
    ? detailSegments
    : selectedSource?.segment_matches || [];

  const totalSegments = multilingualData?.total || 0;
  const totalPages = Math.ceil(totalSegments / pagination.limit);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const handleAddSource = (sourceData: SourceData) => {
    if (sourceData?.content) {
      onAddSource(sourceData);
      onOpenChange(false);
      setSelectedSource(null);
    }
  };

  const handleTitleClick = (source: any) => {
    setSelectedSource((prev: any) => (prev?.id === source.id ? null : source));
  };

  const renderSegmentList = () => {
    if (sources.length === 0) {
      return (
        <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
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

    if (searchOnlyTitles) {
      return (
        <>
          {sources.map((source: any, index: number) => {
            const isSelected = selectedSource?.id === source.id;
            return (
              <div key={source.id || index}>
                <button
                  className={`border p-3 rounded-md text-left w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-input/50 ${
                    isSelected
                      ? "border-[#801A1E] dark:border-[#801A1E]"
                      : "border-gray-300 dark:border-[#313132]"
                  }`}
                  onClick={() => handleTitleClick(source)}
                >
                  <p className="font-bold text-[#801A1E] dark:text-[#b0b0b0]">
                    {source.title}
                  </p>
                  <img src={pechaIcon} alt="source icon" className="w-8 h-8" />
                </button>

                {isSelected && segments.length > 0 && (
                  <SelectedSourceDetail
                    segments={segments}
                    selectedSource={selectedSource}
                    onAdd={handleAddSource}
                    bottomRef={bottomSentinelRef}
                    isFetchingNextPage={isFetchingNextPage}
                  />
                )}
              </div>
            );
          })}
        </>
      );
    }

    return sources.map((source: any) => (
      <SourceItem
        key={source.text.text_id}
        source={source}
        onSegment={handleAddSource}
        searchQuery={debouncedSearchFilter}
      />
    ));
  };

  return (
    <Pecha.Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedSource(null);
          setSearchFilter("");
          setPagination({ currentPage: 1, limit: 10 });
        }
        onOpenChange(open);
      }}
    >
      <Pecha.SheetContent side="right" className="w-full sm:max-w-md">
        <Pecha.SheetHeader>
          <Pecha.SheetTitle>Add Source</Pecha.SheetTitle>
          <Pecha.SheetDescription>
            Search for a source to add to your task
          </Pecha.SheetDescription>
        </Pecha.SheetHeader>
        <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
        <div className="px-2 pt-2">
          <div className="border w-full px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4" />
            <Pecha.Input
              placeholder={t("common.placeholder.search")}
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 px-1 pt-5 cursor-pointer">
            <Pecha.Checkbox
              checked={searchOnlyTitles}
              onCheckedChange={(checked: boolean) => {
                setSearchOnlyTitles(!!checked);
                setPagination({ currentPage: 1, limit: 10 });
                setSelectedSource(null);
              }}
              className="data-[state=checked]:bg-transparent data-[state=checked]:text-primary"
            />
            <span className="text-sm select-none">Search only titles</span>
          </label>
        </div>
        <div className="h-[calc(100vh-200px)] overflow-hidden flex flex-col">
          <div className="px-4 pb-4 pt-2 flex-1 min-h-0 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {isLoading ? (
              <div className="w-full flex items-center justify-center h-full">
                <p>Loading segments...</p>
              </div>
            ) : (
              renderSegmentList()
            )}
          </div>
        </div>
        {sources.length > 0 && !searchOnlyTitles && (
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
