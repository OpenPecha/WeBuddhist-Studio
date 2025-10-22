import { Pecha } from "@/components/ui/shadimport";
import { IoMdAdd, IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import pechaIcon from "@/assets/icon/pecha_icon.png";

interface ContentTypeSelectorProps {
  showContentTypes: boolean;
  onToggle: () => void;
  onSelectType: (type: "image" | "video" | "audio" | "text") => void;
}

const contentTypes = [
  {
    key: "image",
    icon: <MdOutlineImage className="w-4 h-4 text-gray-400" />,
    testid: "image-button",
  },
  {
    key: "audio",
    icon: <IoMusicalNotesSharp className="w-4 h-4 text-gray-400" />,
    testid: "audio-button",
  },
  {
    key: "video",
    icon: <IoMdVideocam className="w-4 h-4 text-gray-400" />,
    testid: "video-button",
  },
  {
    key: "text",
    icon: <IoTextOutline className="w-4 h-4 text-gray-400" />,
    testid: "text-button",
  },
  {
    key: "pecha",
    icon: <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />,
    testid: "pecha-button",
  },
];

export const ContentTypeSelector = ({
  showContentTypes,
  onToggle,
  onSelectType,
}: ContentTypeSelectorProps) => {
  return (
    <div className="flex h-12 items-center gap-4">
      <Pecha.Button
        type="button"
        variant="outline"
        className="h-full"
        onClick={onToggle}
        data-testid="add-content-button"
      >
        <IoMdAdd className="w-4 h-4 text-gray-400" />
      </Pecha.Button>

      {showContentTypes && (
        <div className="flex border h-full items-center p-2 border-gray-300 dark:border-input rounded-sm overflow-hidden">
          {contentTypes.map(({ key, icon, testid }) => (
            <Pecha.Button
              key={key}
              type="button"
              variant="ghost"
              onClick={() => onSelectType(key as any)}
              data-testid={testid}
            >
              {icon}
            </Pecha.Button>
          ))}
        </div>
      )}
    </div>
  );
};
