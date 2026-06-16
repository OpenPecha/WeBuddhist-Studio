import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import { Calendar } from "@/components/ui/atoms/calendar";
import { PLAN_LANGUAGE } from "@/lib/constant";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  createVerseOfDay,
  updateVerseOfDay,
  type VerseOfDayPayload,
  type VerseOfDayItem,
} from "./api/verseOfDayApi";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { format, parse } from "date-fns";

interface VerseOfDayFormProps {
  mode: "create" | "edit";
  initialData?: VerseOfDayItem;
  onSuccess: () => void;
  onCancel: () => void;
  existingVerses: VerseOfDayItem[];
}

type LanguageCode = "EN" | "BO" | "ZH";

const VerseOfDayForm = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
  existingVerses,
}: VerseOfDayFormProps) => {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("EN");
  const [verses, setVerses] = useState({
    en: "",
    bo: "",
    zh: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setVerses({
        en: initialData.verses.en || "",
        bo: initialData.verses.bo || "",
        zh: initialData.verses.zh || "",
      });
      // Don't set presigned URL as image_urls - it will be skipped during update
      // User can add new S3 keys if they want to change the image
      setImageUrls([]);
      // Use group_id directly from the response
      setGroupId(initialData.group_id || "");
      setDate(parse(initialData.date, "yyyy-MM-dd", new Date()));
    } else {
      setActiveLanguage("EN");
      setVerses({ en: "", bo: "", zh: "" });
      setImageUrls([]);
      setImageUrlInput("");
      setGroupId("");
      setDate(new Date());
    }
  }, [mode, initialData]);

  const createMutation = useMutation({
    mutationFn: createVerseOfDay,
    onSuccess: () => {
      toast.success("Verse of Day created successfully!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VerseOfDayPayload }) =>
      updateVerseOfDay(id, payload),
    onSuccess: () => {
      toast.success("Verse of Day updated successfully!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (trimmed && !imageUrls.includes(trimmed)) {
      setImageUrls([...imageUrls, trimmed]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verses.en.trim() && !verses.bo.trim() && !verses.zh.trim()) {
      toast.error("At least one verse content is required");
      return;
    }

    if (!groupId.trim()) {
      toast.error("Group ID is required");
      return;
    }

    if (!date) {
      toast.error("Date is required");
      return;
    }

    // Check for duplicate date (only when creating or changing date in edit mode)
    const selectedDate = format(date, "yyyy-MM-dd");
    const isDuplicateDate = existingVerses.some((verse) => {
      // When editing, exclude the current verse from the check
      if (mode === "edit" && initialData && verse.id === initialData.id) {
        return false;
      }
      return verse.date === selectedDate;
    });

    if (isDuplicateDate) {
      toast.error(`A verse already exists for ${format(date, "PPP")}. Please choose a different date.`);
      return;
    }

    // For create, send all required fields
    // For update, only send fields that have changed
    if (mode === "edit" && initialData) {
      const updatePayload: any = {
        verses: {
          en: verses.en.trim(),
          bo: verses.bo.trim(),
          zh: verses.zh.trim(),
        },
      };

      // Only include date if it changed
      const newDate = format(date, "yyyy-MM-dd");
      if (newDate !== initialData.date) {
        updatePayload.date = newDate;
      }

      // Only include image_urls if user added new ones (not presigned URLs)
      if (imageUrls.length > 0 && !imageUrls[0]?.includes("?")) {
        updatePayload.image_urls = imageUrls;
      }

      // Only include group_id if it's a valid UUID
      const trimmedGroupId = String(groupId).trim();
      if (trimmedGroupId && trimmedGroupId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        updatePayload.group_id = trimmedGroupId;
      }

      updateMutation.mutate({ id: initialData.id, payload: updatePayload });
    } else {
      const createPayload: any = {
        verses: {
          en: verses.en.trim(),
          bo: verses.bo.trim(),
          zh: verses.zh.trim(),
        },
        image_urls: imageUrls.length > 0 ? imageUrls : [],
        group_id: groupId.trim() || null,
        date: format(date, "yyyy-MM-dd"),
      };
      createMutation.mutate(createPayload);
    }
  };

  const handleVerseChange = (value: string) => {
    setVerses({
      ...verses,
      [activeLanguage.toLowerCase()]: value,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-bold">Verse Content</label>
        <div className="flex gap-2 border-b">
          {PLAN_LANGUAGE.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setActiveLanguage(lang.value as LanguageCode)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeLanguage === lang.value
                  ? "border-b-2 border-[#A51C21] text-[#A51C21]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <Textarea
          value={verses[activeLanguage.toLowerCase() as keyof typeof verses]}
          onChange={(e) => handleVerseChange(e.target.value)}
          placeholder={`Enter verse content in ${PLAN_LANGUAGE.find((l) => l.value === activeLanguage)?.label}`}
          className="min-h-[120px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Image URLs</label>
        
        {/* Show current image preview when editing */}
        {mode === "edit" && initialData?.image_url && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-1">Current Image:</p>
            <img
              src={initialData.image_url}
              alt="Current verse image"
              className="h-24 w-24 rounded object-cover border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <Pecha.Input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder={mode === "edit" ? "Enter new S3 key to replace image" : "Enter S3 key (e.g., images/verse_of_day/image.jpg)"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImageUrl();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddImageUrl}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <IoMdAdd className="h-4 w-4" />
          </Button>
        </div>
        {imageUrls.length > 0 && (
          <div className="space-y-2">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded border p-2"
              >
                <span className="flex-1 truncate text-sm">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImageUrl(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IoMdClose className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Group ID</label>
        <Pecha.Input
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Enter group ID (UUID)"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Date</label>
        <Pecha.Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <Pecha.PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </Pecha.PopoverTrigger>
          <Pecha.PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setShowCalendar(false);
              }}
              initialFocus
            />
          </Pecha.PopoverContent>
        </Pecha.Popover>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
          disabled={isPending}
        >
          {isPending
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update"
              : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default VerseOfDayForm;
