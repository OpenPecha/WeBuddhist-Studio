import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  createPoem,
  updatePoem,
  type PoemItem,
  type PoemStatus,
  type CreatePoemPayload,
  type UpdatePoemPayload,
} from "./api/poemApi";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { IoMdAdd, IoMdClose } from "react-icons/io";

interface PoemFormProps {
  mode: "create" | "edit";
  initialData?: PoemItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const PoemForm = ({ mode, initialData, onSuccess, onCancel }: PoemFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [poemStatus, setPoemStatus] = useState<PoemStatus>("DRAFT");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setAuthorName(initialData.author_name);
      setChapterName(initialData.chapter_name || "");
      setPoemStatus(initialData.status);
      setImageKey(null);
      setImagePreview(initialData.image_url || null);
    } else {
      setTitle("");
      setContent("");
      setAuthorName("");
      setChapterName("");
      setPoemStatus("DRAFT");
      setImageKey(null);
      setImagePreview(null);
    }
  }, [mode, initialData]);

  const createMutation = useMutation({
    mutationFn: createPoem,
    onSuccess: () => {
      toast.success("Poem created successfully!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePoemPayload }) =>
      updatePoem(id, payload),
    onSuccess: () => {
      toast.success("Poem updated successfully!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

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

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!authorName.trim()) {
      toast.error("Author name is required");
      return;
    }

    if (mode === "edit" && initialData) {
      const payload: UpdatePoemPayload = {
        title: title.trim(),
        content: content.trim(),
        author_name: authorName.trim(),
        chapter_name: chapterName.trim() || null,
        status: poemStatus,
        ...(imageKey && { image_key: imageKey }),
      };
      updateMutation.mutate({ id: initialData.id, payload });
    } else {
      const payload: CreatePoemPayload = {
        title: title.trim(),
        content: content.trim(),
        author_name: authorName.trim(),
        chapter_name: chapterName.trim() || null,
        status: poemStatus,
        ...(imageKey && { image_key: imageKey }),
      };
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-bold">Title</label>
        <Pecha.Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter poem title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter poem content"
          className="min-h-[160px] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold">Author</label>
          <Pecha.Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Chapter (optional)</label>
          <Pecha.Input
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            placeholder="Chapter name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Status</label>
        <Pecha.Select
          value={poemStatus}
          onValueChange={(v) => setPoemStatus(v as PoemStatus)}
        >
          <Pecha.SelectTrigger className="w-[200px]">
            <Pecha.SelectValue />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            <Pecha.SelectItem value="DRAFT">Draft</Pecha.SelectItem>
            <Pecha.SelectItem value="PUBLISHED">Published</Pecha.SelectItem>
          </Pecha.SelectContent>
        </Pecha.Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Image (optional)</label>
        <div className="flex gap-4 items-start">
          {!imagePreview && (
            <button
              type="button"
              onClick={() => setIsImageDialogOpen(true)}
              className="border w-32 h-24 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
              aria-label="Upload poem image"
            >
              <IoMdAdd className="h-8 w-8 text-gray-400" />
            </button>
          )}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Poem preview"
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

      <Pecha.Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
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
    </form>
  );
};

export default PoemForm;
