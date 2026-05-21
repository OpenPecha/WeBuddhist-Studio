import { useEffect, useState } from "react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import { toast } from "sonner";
import type { PlanOption, Tag, TagPayload } from "./api/tagsApi";

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
  plans: PlanOption[];
  isSubmitting: boolean;
  onSubmit: (payload: TagPayload) => void;
}

const TagFormDialog = ({
  open,
  onOpenChange,
  tag,
  plans,
  isSubmitting,
  onSubmit,
}: TagFormDialogProps) => {
  const isEdit = !!tag;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [planSearch, setPlanSearch] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(tag?.name ?? "");
    setDescription(tag?.description ?? "");
    setImageKey(tag?.image_key ?? null);
    setImagePreview(tag?.image ?? null);
    setSelectedPlanIds(tag?.plan_ids ?? []);
    setPlanSearch("");
  }, [open, tag]);

  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(planSearch.toLowerCase()),
  );

  const togglePlan = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      const { image, key } = await uploadImageToS3(file, "");
      setImagePreview(image.original);
      setImageKey(key);
      setIsImageDialogOpen(false);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      if (error?.response?.status === 413) {
        toast.error("Failed to upload image", {
          description: "File exceeds the maximum size of 1MB",
        });
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageKey(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Tag name is required");
      return;
    }
    onSubmit({
      name: trimmedName,
      image_key: imageKey,
      description: description.trim() || null,
      plan_ids: selectedPlanIds,
    });
  };

  return (
    <>
      <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
        <Pecha.DialogContent className="flex max-h-[min(90dvh,90vh)] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <Pecha.DialogHeader className="shrink-0 border-b px-6 py-4">
            <Pecha.DialogTitle>
              {isEdit ? "Edit Tag" : "Create Tag"}
            </Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Name</label>
                <Pecha.Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tag name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="field-sizing-fixed min-h-[80px] max-h-32 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Image</label>
                <div className="flex gap-4 items-start">
                  {!imagePreview && (
                    <button
                      type="button"
                      onClick={() => setIsImageDialogOpen(true)}
                      className="border w-32 h-24 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                      aria-label="Upload tag image"
                    >
                      <IoMdAdd className="h-8 w-8 text-gray-400" />
                    </button>
                  )}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Tag preview"
                        className="w-32 h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                        aria-label="Remove image"
                      >
                        <IoMdClose className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Linked plans</label>
                <Pecha.Input
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  placeholder="Search plans..."
                />
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {filteredPlans.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">
                      No plans found
                    </p>
                  ) : (
                    filteredPlans.map((plan) => (
                      <label
                        key={plan.id}
                        className="flex min-w-0 items-center gap-2 rounded px-2 py-1 hover:bg-muted/50 cursor-pointer"
                      >
                        <Pecha.Checkbox
                          className="shrink-0"
                          checked={selectedPlanIds.includes(plan.id)}
                          onCheckedChange={() => togglePlan(plan.id)}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {plan.title}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPlanIds.length} plan(s) selected
                </p>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.Dialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
      >
        <Pecha.DialogContent showCloseButton>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Upload & Crop Image</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <ImageContentData
            onUpload={handleImageUpload}
            isLoading={isImageUploading}
          />
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </>
  );
};

export default TagFormDialog;
