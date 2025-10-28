import { Pecha } from "@/components/ui/shadimport";
import { IoMdAdd, IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
// import pechaIcon from "@/assets/icon/pecha_icon.png";
import { useState } from "react";

interface ContentTypeSelectorProps {
  onSelectType: (type: "IMAGE" | "VIDEO" | "AUDIO" | "TEXT") => void;
}

const iconClassName = "w-4 h-4 text-gray-400";

const contentTypes = [
  {
    key: "IMAGE",
    icon: <MdOutlineImage className={iconClassName} />,
  },
  {
    key: "AUDIO",
    icon: <IoMusicalNotesSharp className={iconClassName} />,
  },
  {
    key: "VIDEO",
    icon: <IoMdVideocam className={iconClassName} />,
  },
  {
    key: "TEXT",
    icon: <IoTextOutline className={iconClassName} />,
  },
  // {
  //   key: "PECHA",
  //   icon: <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />,
  // },
];

export const ContentTypeSelector = ({
  onSelectType,
}: ContentTypeSelectorProps) => {
  const [showContentTypes, setShowContentTypes] = useState(false);

  return (
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
              onClick={() => onSelectType(key as any)}
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
  );
};
