import { Pecha } from "@/components/ui/shadimport";
import { IoMdAdd, IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import pechaIcon from "@/assets/icon/pecha_icon.png";
import { useState } from "react";
import { SourceSelectorSheet } from "../webuddhist-source/SourceSelectorSheet";

interface ContentTypeSelectorProps {
  onSelectType: (
    type: "IMAGE" | "VIDEO" | "AUDIO" | "TEXT" | "SOURCE_REFERENCE",
    sourceContent?: string,
  ) => void;
}

const iconClassName = "w-4 h-4 text-gray-400";

const contentTypes = [
  {
    key: "IMAGE",
    icon: <MdOutlineImage className={iconClassName} />,
  },
  // {
  //   key: "AUDIO",
  //   icon: <IoMusicalNotesSharp className={iconClassName} />,
  // },
  {
    key: "VIDEO",
    icon: <IoMdVideocam className={iconClassName} />,
  },
  {
    key: "TEXT",
    icon: <IoTextOutline className={iconClassName} />,
  },
  {
    key: "SOURCE_REFERENCE",
    icon: <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />,
  },
];

export const ContentTypeSelector = ({
  onSelectType,
}: ContentTypeSelectorProps) => {
  const [showContentTypes, setShowContentTypes] = useState(false);
  const [isSourceSheetOpen, setIsSourceSheetOpen] = useState(false);

  const handleContentTypeClick = (type: string) => {
    if (type === "SOURCE_REFERENCE") {
      setIsSourceSheetOpen(true);
      setShowContentTypes(false);
    } else {
      onSelectType(type as any);
    }
  };

  const handleAddSource = (sourceContent: string) => {
    onSelectType("SOURCE_REFERENCE", sourceContent);
    setIsSourceSheetOpen(false);
  };

  return (
    <>
      <div className="flex h-12 px-4 items-center gap-4">
        <Pecha.Button
          type="button"
          variant="outline"
          className="h-full transition-transform active:scale-95"
          onClick={() => setShowContentTypes(!showContentTypes)}
        >
          <IoMdAdd
            className={`${iconClassName} transition-transform duration-300 ${showContentTypes ? "rotate-45" : "rotate-0"}`}
          />
        </Pecha.Button>

        {showContentTypes && (
          <div className="flex border h-full bg-white dark:bg-[#161616] items-center px-1 border-gray-300 dark:border-input rounded-sm overflow-visible animate-in zoom-in-90 slide-in-from-left-3 duration-300 ease-out">
            {contentTypes.map(({ key, icon }, index) => (
              <Pecha.Button
                key={key}
                type="button"
                variant="ghost"
                onClick={() => handleContentTypeClick(key)}
                className="animate-in fade-in zoom-in-50 duration-300 ease-out hover:scale-110 transition-transform"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {icon}
              </Pecha.Button>
            ))}
          </div>
        )}
      </div>

      <SourceSelectorSheet
        isOpen={isSourceSheetOpen}
        onOpenChange={setIsSourceSheetOpen}
        onAddSource={handleAddSource}
      />
    </>
  );
};
