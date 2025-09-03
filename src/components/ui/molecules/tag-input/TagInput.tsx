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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="border-[#AE3237] border-2 space-x-4 w-fit  px-2 rounded-md py-2 flex items-center justify-between"
            >
              <p className="text-sm">{tag}</p>
              <X
                className="h-4 w-4 hover:text-[#AE3237] transition cursor-pointer"
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
