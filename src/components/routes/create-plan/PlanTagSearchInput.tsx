import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDebounce } from "use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/atoms/input";
import {
  createTag,
  fetchTags,
  type PlanTagSummary,
  type Tag,
} from "@/components/routes/tags/api/tagsApi";

interface PlanTagSearchInputProps {
  value?: string[];
  onChange?: (tagIds: string[]) => void;
  initialTags?: PlanTagSummary[];
  planId?: string;
}

const SUGGESTIONS_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

const normalizeName = (name: string) => name.trim().toLowerCase();

const PlanTagSearchInput = ({
  value = [],
  onChange,
  initialTags = [],
  planId,
}: PlanTagSearchInputProps) => {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch] = useDebounce(inputValue, SEARCH_DEBOUNCE_MS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tagLabels, setTagLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialTags.map((tag) => [tag.id, tag.name])),
  );

  useEffect(() => {
    if (!initialTags.length) return;
    setTagLabels((prev) => ({
      ...prev,
      ...Object.fromEntries(initialTags.map((tag) => [tag.id, tag.name])),
    }));
  }, [initialTags]);

  const { data, isFetching } = useQuery({
    queryKey: ["cms-tags-search", debouncedSearch],
    queryFn: () => fetchTags(1, SUGGESTIONS_LIMIT, debouncedSearch.trim()),
    enabled: showSuggestions && debouncedSearch.trim().length > 0,
    refetchOnWindowFocus: false,
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) =>
      createTag({
        name: name.trim(),
        description: null,
        image_key: null,
        plan_ids: planId ? [planId] : [],
      }),
    onSuccess: (tag: Tag) => {
      queryClient.invalidateQueries({ queryKey: ["cms-tags-search"] });
      queryClient.invalidateQueries({ queryKey: ["cms-tags"] });
      addTag(tag);
      setInputValue("");
      setShowSuggestions(false);
      toast.success(`Tag "${tag.name}" created`);
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  const suggestions = (data?.tags ?? []).filter((tag) => !value.includes(tag.id));
  const trimmedInput = inputValue.trim();
  const normalizedInput = normalizeName(trimmedInput);

  const hasExactMatch = suggestions.some(
    (tag) => normalizeName(tag.name) === normalizedInput,
  );
  const showCreateOption =
    trimmedInput.length > 0 &&
    !hasExactMatch &&
    !value.some((id) => normalizeName(tagLabels[id] ?? "") === normalizedInput);

  const addTag = (tag: { id: string; name: string }) => {
    if (value.includes(tag.id)) return;
    setTagLabels((prev) => ({ ...prev, [tag.id]: tag.name }));
    onChange?.([...value, tag.id]);
  };

  const removeTag = (tagId: string) => {
    onChange?.(value.filter((id) => id !== tagId));
  };

  const selectSuggestion = (tag: { id: string; name: string }) => {
    addTag(tag);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleCreateTag = () => {
    if (!trimmedInput || createTagMutation.isPending) return;
    createTagMutation.mutate(trimmedInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!trimmedInput) return;

      const exactSuggestion = suggestions.find(
        (tag) => normalizeName(tag.name) === normalizedInput,
      );
      if (exactSuggestion) {
        selectSuggestion(exactSuggestion);
        return;
      }
      if (showCreateOption) {
        handleCreateTag();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    showSuggestions &&
    trimmedInput.length > 0 &&
    (isFetching || suggestions.length > 0 || showCreateOption);

  return (
    <div
      ref={containerRef}
      className="w-full space-y-2 h-full font-dynamic flex flex-col"
    >
      <p className="text-sm font-bold">Tags</p>

      {value.length > 0 && (
        <div className="flex flex-wrap items-center justify-start h-fit gap-2">
          {value.map((tagId) => (
            <div
              key={tagId}
              className="bg-gray-100 dark:bg-input/30 space-x-4 h-fit w-fit border border-dashed px-4 rounded-full py-2 flex items-center justify-between"
            >
              <p className="text-sm text-gray-500 dark:text-gray-100">
                {tagLabels[tagId] ?? tagId}
              </p>
              <button
                type="button"
                aria-label={`Remove ${tagLabels[tagId] ?? "tag"}`}
                onClick={() => removeTag(tagId)}
                className="cursor-pointer"
              >
                <IoMdClose className="h-5 w-5 text-white rounded-full p-1 border border-dashed dark:bg-input/90 bg-gray-300 hover:bg-gray-400 transition" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full">
        <Input
          placeholder="Search or add tags..."
          className="border shadow-none bg-white"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          disabled={createTagMutation.isPending}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {showDropdown && (
          <ul
            className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-white dark:bg-[#1e1e1e] shadow-md py-1"
            role="listbox"
          >
            {showCreateOption && (
              <li role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-[#A51C21] hover:bg-muted/50 cursor-pointer font-medium border-b"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCreateTag}
                  disabled={createTagMutation.isPending}
                >
                  {createTagMutation.isPending
                    ? "Creating tag..."
                    : `Create "${trimmedInput}"`}
                </button>
              </li>
            )}
            {isFetching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </li>
            )}
            {suggestions.map((tag) => (
              <li key={tag.id} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(tag)}
                >
                  {tag.name}
                </button>
              </li>
            ))}
            {!isFetching &&
              suggestions.length === 0 &&
              !showCreateOption && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  No tags found
                </li>
              )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlanTagSearchInput;
