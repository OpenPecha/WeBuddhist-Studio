import { Pecha } from "@/components/ui/shadimport";
import { useMemo, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import SourceItem from "./sourceItem";
import pechaIcon from "@/assets/icon/pecha_icon.png";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { searchSources } from "@/components/api/searchApi";

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

const parseRange = (
  input: string,
  max: number,
): { start: number; end: number } | null => {
  const match = input.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  if (start < 1 || end < start || start > max) return null;
  return { start, end: Math.min(end, max) };
};

const SelectedSourceDetail = ({
  segments,
  selectedSource,
  onAdd,
}: {
  segments: any[];
  selectedSource: any;
  onAdd: (sourceData: SourceData) => void;
}) => {
  const [rangeInput, setRangeInput] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const segmentCount = segments.length;

  const parsedRange = useMemo(() => {
    if (!segmentCount) return null;
    return parseRange(rangeInput, segmentCount);
  }, [rangeInput, segmentCount]);

  const isAddDisabled = !parsedRange;

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && segmentCount > 0) {
      setRangeInput(`1-${segmentCount}`);
    } else {
      setRangeInput("");
    }
  };

  const handleAdd = () => {
    if (!parsedRange || !selectedSource) return;
    const { start, end } = parsedRange;
    const selected = segments.slice(start - 1, end);
    const content = selected.map((seg: any) => seg.content).join("\n");
    const segmentIds = selected.map((seg: any) => seg.segment_id);
    const pechaSegmentId = selected[0]?.pecha_segment_id || "";

    onAdd({
      content,
      pecha_segment_id: pechaSegmentId,
      text_id: selectedSource.text.text_id,
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
          placeholder={`1-${segmentCount}`}
          value={rangeInput}
          onChange={(e) => {
            setRangeInput(e.target.value);
            setSelectAll(false);
          }}
          className="flex-1 h-10"
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

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {segments.map((segment: any, segIndex: number) => (
          <div
            key={segment.segment_id || segIndex}
            className="border p-3 rounded-md border-dashed border-gray-300 dark:border-[#313132] text-sm"
          >
            <span className="font-medium">{segIndex + 1}. </span>
            <span
              dangerouslySetInnerHTML={{
                __html: segment.content,
              }}
            />
          </div>
        ))}
      </div>
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
  const { data: searchData, isLoading } = useQuery({
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
    enabled: isOpen,
  });
  const totalSegments = searchData?.total || 0;
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

  const sources = searchData?.sources || [];
  const segments = selectedSource?.segment_matches || [];

  const handleTitleClick = (source: any) => {
    setSelectedSource(source);
  };

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

    if (searchOnlyTitles) {
      return (
        <>
          {sources.map((source: any, index: number) => {
            const isSelected =
              selectedSource?.text.text_id === source.text.text_id;
            return (
              <div key={source.text.text_id || index}>
                <button
                  className={`border p-3 rounded-md text-left w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-input/50 ${
                    isSelected
                      ? "border-[#801A1E] dark:border-[#801A1E]"
                      : "border-gray-300 dark:border-[#313132]"
                  }`}
                  onClick={() => handleTitleClick(source)}
                >
                  <p className="font-bold text-[#801A1E] dark:text-[#b0b0b0]">
                    {source.text.title}
                  </p>
                  <img src={pechaIcon} alt="source icon" className="w-8 h-8" />
                </button>

                {isSelected && segments.length > 0 && (
                  <SelectedSourceDetail
                    segments={segments}
                    selectedSource={selectedSource}
                    onAdd={handleAddSource}
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
      />
    ));
  };

  return (
    <Pecha.Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedSource(null);
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
              onCheckedChange={(checked: boolean) =>
                setSearchOnlyTitles(!!checked)
              }
              className="data-[state=checked]:bg-transparent data-[state=checked]:text-primary"
            />
            <span className="text-sm select-none">Search only titles</span>
          </label>
        </div>
        <div className="px-4 pt-1.5 pb-4 space-y-4 h-[540px] overflow-y-auto">
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
