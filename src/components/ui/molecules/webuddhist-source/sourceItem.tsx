import pechaIcon from "@/assets/icon/pecha_icon.png";
import { highlightSearchMatch } from "@/lib/utils";

const SourceItem = ({ source, onSegment, searchQuery }: any) => {
  return (
    <div className="border p-2 space-y-4 rounded-md max-h-[calc(100vh-370px)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#801A1E] dark:text-[#b0b0b0]">
          {source.text.title}
        </p>
        <img src={pechaIcon} alt="source icon" className="w-8 h-8" />
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        {source.segment_matches?.map((segment: any, index: number) => (
          <button
            key={segment.segment_id || index}
            aria-label={`Select segment ${index + 1}`}
            className="border p-2 rounded-md text-left border-dashed border-gray-300 dark:border-[#313132] text-sm cursor-pointer"
            onClick={() =>
              onSegment?.({
                content: segment.content,
                pecha_segment_id: segment.pecha_segment_id,
                text_id: source.text.text_id,
                segment_ids: [segment.segment_id],
              })
            }
          >
            <div
              dangerouslySetInnerHTML={{
                __html: searchQuery
                  ? highlightSearchMatch(
                      segment.content,
                      searchQuery,
                      "bg-yellow-300 px-0.5 text-black",
                    )
                  : segment.content,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SourceItem;
