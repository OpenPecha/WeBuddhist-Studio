import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/atoms/textarea";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
};

const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  textareaClassName,
}: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className={cn("rounded-md border border-input", className)}>
      <div className="flex border-b border-input">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "write"
              ? "text-foreground border-b-2 border-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "preview"
              ? "text-foreground border-b-2 border-foreground -mb-px"
              : "text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          Preview
        </button>
      </div>

      {activeTab === "write" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[100px] w-full border-0 rounded-t-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none",
            textareaClassName,
          )}
        />
      ) : (
        <div
          className={cn(
            "min-h-[100px] w-full px-3 py-2 text-base",
            "prose prose-sm dark:prose-invert max-w-none",
          )}
        >
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
};

export { MarkdownEditor };
