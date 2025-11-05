import pechaIcon from "@/assets/icon/pecha_icon.png";

const SourceItem = ({ source, onSegment }: any) => {
  return (
    <div className="border p-2 space-y-4 rounded-md">
      <div className="flex items-center justify-between">
        <p className=" font-bold text-[#801A1E] dark:text-[#b0b0b0]">
          {source.text.title}
        </p>
        <img src={pechaIcon} alt="source icon" className="w-8 h-8" />
      </div>
      <div className="flex flex-col gap-2">
        {source.segment_match.map((segment: any) => (
          <button
            className="border p-2 rounded-md text-left border-dashed border-gray-300 dark:border-[#313132] text-sm"
            onClick={() => onSegment?.(segment.content)}
          >
            <div dangerouslySetInnerHTML={{ __html: segment.content }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SourceItem;
