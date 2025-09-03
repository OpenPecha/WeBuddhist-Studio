import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../atoms/input";

const TagInput = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      setTags([inputValue.trim(), ...tags]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };
  return (
    <div className=" w-full space-y-2 h-full font-dynamic flex flex-col">
      <p className="text-sm font-bold">Tags</p>
      <div className=" w-full border p-2 h-100 space-y-4 rounded-md">
        <Input
          placeholder="Add a tag"
          className=" border-none shadow-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className=" bg-gray-100 dark:bg-input/30 space-x-4 w-fit border border-dashed px-4 rounded-full py-2 flex items-center justify-between"
            >
              <p className="text-sm text-gray-500 dark:text-gray-100">{tag}</p>
              <X
                className=" h-5 w-5 text-white rounded-full p-1 border border-dashed dark:bg-input/90 bg-gray-300 hover:bg-gray-400 transition cursor-pointer"
                onClick={() => removeTag(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagInput;
