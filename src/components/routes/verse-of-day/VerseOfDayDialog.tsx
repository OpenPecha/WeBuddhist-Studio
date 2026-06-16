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
  type VerseOfDayPayload,
} from "./api/verseOfDayApi";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { format } from "date-fns";

interface VerseOfDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LanguageCode = "EN" | "BO" | "ZH";

const VerseOfDayDialog = ({ open, onOpenChange }: VerseOfDayDialogProps) => {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("EN");
  const [verses, setVerses] = useState({
    en: "",
    bo: "",
    zh: "",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [verseId, setVerseId] = useState("");
  const [refId, setRefId] = useState("");
  const [refType, setRefType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveLanguage("EN");
      setVerses({ en: "", bo: "", zh: "" });
      setImageUrls([]);
      setImageUrlInput("");
      setVerseId("");
      setRefId("");
      setRefType("");
      setGroupId("");
      setDate(new Date());
      setShowCalendar(false);
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: createVerseOfDay,
    onSuccess: () => {
      toast.success("Verse of Day created successfully!");
      onOpenChange(false);
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

    const payload: VerseOfDayPayload = {
      verses: {
        en: verses.en.trim(),
        bo: verses.bo.trim(),
        zh: verses.zh.trim(),
      },
      image_urls: imageUrls,
      verse_id: verseId.trim(),
      ref_id: refId.trim(),
      ref_type: refType.trim(),
      group_id: groupId.trim(),
      date: format(date, "yyyy-MM-dd"),
    };

    createMutation.mutate(payload);
  };

  const handleVerseChange = (value: string) => {
    setVerses({
      ...verses,
      [activeLanguage.toLowerCase()]: value,
    });
  };

  return (
    <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
      <Pecha.DialogContent className="flex max-h-[min(90dvh,90vh)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <Pecha.DialogHeader className="shrink-0 border-b px-6 py-4">
          <Pecha.DialogTitle>Create Verse of Day</Pecha.DialogTitle>
        </Pecha.DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
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
              <div className="flex gap-2">
                <Pecha.Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Enter image URL"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Verse ID (Optional)</label>
                <Pecha.Input
                  value={verseId}
                  onChange={(e) => setVerseId(e.target.value)}
                  placeholder="Enter verse ID"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Reference ID (Optional)</label>
                <Pecha.Input
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="Enter reference ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Reference Type (Optional)</label>
                <Pecha.Input
                  value={refType}
                  onChange={(e) => setRefType(e.target.value)}
                  placeholder="Enter reference type"
                />
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
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Pecha.DialogContent>
    </Pecha.Dialog>
  );
};

export default VerseOfDayDialog;
