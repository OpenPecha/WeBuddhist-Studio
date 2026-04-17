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
import {
  searchSources,
  searchTitles,
  fetchTextDetails,
} from "@/components/api/searchApi";
import { flattenSegments, getLastSegmentId } from "@/lib/utils";

interface SourceData {
  content: string;
  pecha_segment_id: string;
  text_id: string;
  segment_ids: string[];
}

interface SourceSelectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceData: SourceData) => void;
}

const RANGE_REGEX = /^(\d+)\s*-\s*(\d+)$/;
const SINGLE_REGEX = /^(\d+)$/;

const parseSelection = (input: string, max: number): Set<number> | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const rangeMatch = RANGE_REGEX.exec(trimmed);
  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1], 10);
    const end = Number.parseInt(rangeMatch[2], 10);
    if (start < 1 || end < start || start > max) return null;
    const selected = new Set<number>();
    for (let i = start; i <= Math.min(end, max); i++) selected.add(i);
    return selected;
  }

  const singleMatch = SINGLE_REGEX.exec(trimmed);
  if (singleMatch) {
    const num = Number.parseInt(singleMatch[1], 10);
    if (num < 1 || num > max) return null;
    return new Set([num]);
  }

  return null;
};

const SelectedSourceDetail = ({
  segments,
  selectedSource,
  onAdd,
  bottomRef,
  isFetchingNextPage,
}: {
  segments: any[];
  selectedSource: any;
  onAdd: (sourceData: SourceData) => void;
  bottomRef?: (node?: Element | null) => void;
  isFetchingNextPage?: boolean;
}) => {
  const [rangeInput, setRangeInput] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const segmentCount = segments.length;

  const selectedIndices = useMemo(() => {
    if (!segmentCount) return null;
    return parseSelection(rangeInput, segmentCount);
  }, [rangeInput, segmentCount]);

  const isAddDisabled = !selectedIndices;

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && segmentCount > 0) {
      setRangeInput(`1-${segmentCount}`);
    } else {
      setRangeInput("");
    }
  };

  const handleAdd = () => {
    if (!selectedIndices || !selectedSource) return;
    const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
    const selected = sortedIndices.map((i) => segments[i - 1]).filter(Boolean);
    const content = selected.map((seg: any) => seg.content).join("\n");
    const segmentIds = selected.map((seg: any) => seg.segment_id);
    const pechaSegmentId = selected[0]?.pecha_segment_id || "";

    const textId = selectedSource.id;

    onAdd({
      content,
      pecha_segment_id: pechaSegmentId,
      text_id: textId,
      segment_ids: segmentIds,
    });
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-[#b1b1b1]">
          Select Range (e.g. 1-{segmentCount})
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-sm text-gray-600 dark:text-[#b1b1b1]">
            Select All
          </span>
          <Pecha.Checkbox
            checked={selectAll}
            onCheckedChange={(checked: boolean) => handleSelectAll(!!checked)}
            className="data-[state=checked]:bg-transparent dark:data-[state=checked]:bg-transparent data-[state=checked]:text-primary"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Pecha.Input
          placeholder="1-10"
          value={rangeInput}
          onChange={(e) => {
            setRangeInput(e.target.value);
            setSelectAll(false);
          }}
          className={`flex-1 h-10 ${rangeInput.trim() !== "" && !rangeInput.trim().endsWith("-") && !selectedIndices ? "ring-1 ring-red-500 dark:ring-red-400" : ""}`}
        />
        <Pecha.Button
          type="button"
          variant="destructive"
          disabled={isAddDisabled}
          onClick={handleAdd}
          className="h-10 px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </Pecha.Button>
      </div>

      {rangeInput.trim() !== "" &&
        !rangeInput.trim().endsWith("-") &&
        !selectedIndices && (
          <p className="text-xs text-red-500 dark:text-red-400 -mt-1">
            Enter a single number (e.g. 3) or a range (e.g. 1-10)
          </p>
        )}

      <Pecha.ScrollArea
        type="scroll"
        className="border border-[#DEDEDE] dark:border-[#313132] rounded-[10px] h-[calc(100vh-380px)]"
      >
        <div className="p-4 space-y-4">
          {segments.map((segment: any, segIndex: number) => {
            const isSelected = selectedIndices?.has(segIndex + 1);
            return (
              <div
                key={segment.segment_id || segIndex}
                className={`border p-3 rounded-[10px] text-sm transition-colors ${
                  isSelected
                    ? "bg-[#F9F9F9] dark:bg-sidebar-secondary border-solid border-foreground dark:border-foreground"
                    : "bg-[#F9F9F9] dark:bg-sidebar-secondary border-dashed border-[#E1E1E1] dark:border-[#313132]"
                }`}
              >
                <span className="font-medium">{segIndex + 1}. </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: segment.content,
                  }}
                />
              </div>
            );
          })}
          {bottomRef && (
            <div
              ref={bottomRef}
              className="h-5 w-full opacity-0 pointer-events-none"
            />
          )}
          {isFetchingNextPage && (
            <p className="text-center text-sm text-gray-500">
              Loading more segments...
            </p>
          )}
        </div>
      </Pecha.ScrollArea>
    </div>
  );
};

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
      enabled: isOpen && !searchOnlyTitles,
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
    return detailsData.pages.flatMap((page) =>
      flattenSegments(page.content.sections),
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
  const { t } = useTranslate();

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
          <div
            className={`px-4 pb-4 pt-2 ${
              searchOnlyTitles ? "space-y-4" : "flex-1 min-h-0"
            }`}
          >
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
