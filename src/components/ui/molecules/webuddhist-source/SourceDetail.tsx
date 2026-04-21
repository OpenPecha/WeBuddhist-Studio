import { useMemo, useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { parseSelection } from "@/lib/utils";

export interface SourceData {
  content: string;
  pecha_segment_id: string;
  text_id: string;
  segment_ids: string[];
}

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
        <span className="text-sm text-muted-foreground">
          Select Range (e.g. 1-{segmentCount})
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span
            className={`text-sm select-none${selectAll ? "" : " text-muted-foreground"}`}
          >
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
                className={`border p-3 rounded-[10px] text-sm transition-colors bg-[#F9F9F9] dark:bg-sidebar-secondary  ${
                  isSelected
                    ? "border-solid border-foreground dark:border-foreground"
                    : "dark:bg-sidebar-secondary border-dashed border-[#E1E1E1] dark:border-[#313132]"
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

export default SelectedSourceDetail;
