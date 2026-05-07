import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { seriesSchema } from "@/schema/SeriesSchema";
import { PLAN_LANGUAGE } from "@/lib/constant";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import {
  TitleField,
  DescriptionField,
  CoverImageField,
} from "@/components/ui/molecules/shared-form-fields/SharedFormFields";
import TagInput from "@/components/ui/molecules/tag-input/TagInput";
import PlanSearchSelector from "./components/PlanSearchSelector";
import { uploadImageToS3 } from "../task/api/taskApi";

const CreateSeries = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const { series_id } = useParams();
  const navigate = useNavigate();
  type SeriesFormData = z.infer<typeof seriesSchema>;

  const form = useForm({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      tags: [],
      language: "",
      plan_ids: [],
    },
  });

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue("image_url", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const { image, key } = await uploadImageToS3(
        file,
        series_id === "new" ? "" : series_id || "",
      );
      const imageUrl = image.original;
      const imageKey = key;
      setImagePreview(imageUrl);
      setSelectedImage(file);
      form.setValue("image_url", imageKey, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setIsImageDialogOpen(false);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      if (error?.response?.status === 413) {
        toast.error("Failed to update Image", {
          description: "file exceeds the maximum size of 1MB",
        });
      } else {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image");
      }
    }
  };

  const onSubmit = (data: SeriesFormData) => {
    // TODO: Wire up real create/update series API once endpoint is ready.
    console.log("Series payload:", data);
    toast.success("Series form submitted (UI only)", {
      description: "Check the console for the payload.",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="flex-1 p-4 sm:p-10">
        <h1 className="text-xl font-bold my-4">Series details</h1>

        <Pecha.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TitleField
              control={form.control}
              label="Title"
              placeholder="Enter series title"
            />

            <DescriptionField
              control={form.control}
              label="Description"
              placeholder="Enter series description"
            />

            <CoverImageField
              control={form.control}
              heading="Cover image"
              description="Set a cover image that stands out and draws readers' attention."
              imagePreview={imagePreview}
              selectedImage={selectedImage}
              onOpenUploadDialog={() => setIsImageDialogOpen(true)}
              onRemoveImage={handleRemoveImage}
            />

            <Pecha.Dialog
              open={isImageDialogOpen}
              onOpenChange={setIsImageDialogOpen}
            >
              <Pecha.DialogContent showCloseButton={true}>
                <Pecha.DialogHeader>
                  <Pecha.DialogTitle>Upload & Crop Image</Pecha.DialogTitle>
                </Pecha.DialogHeader>
                <ImageContentData onUpload={handleImageUpload} />
              </Pecha.DialogContent>
            </Pecha.Dialog>
          </form>
        </Pecha.Form>
      </div>

      <div className="flex-1 p-10 sm:mt-9">
        <Pecha.Form {...form}>
          <div className="space-y-6">
            <Pecha.FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    Language
                  </Pecha.FormLabel>
                  <Pecha.Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <Pecha.FormControl>
                      <Pecha.SelectTrigger className="h-12 w-full bg-white">
                        <Pecha.SelectValue placeholder="Select language" />
                      </Pecha.SelectTrigger>
                    </Pecha.FormControl>
                    <Pecha.SelectContent>
                      {PLAN_LANGUAGE.map((lang) => (
                        <Pecha.SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </Pecha.SelectItem>
                      ))}
                    </Pecha.SelectContent>
                  </Pecha.Select>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.FormField
              control={form.control}
              name="plan_ids"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    Included plans
                  </Pecha.FormLabel>
                  <Pecha.FormControl>
                    <PlanSearchSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      size="sm"
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <div className="pt-4 w-full flex justify-end gap-3">
              <Pecha.Button
                type="button"
                variant="outline"
                className="sm:h-12 sm:px-12 font-medium"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Pecha.Button>
              <Pecha.Button
                type="submit"
                variant="default"
                className="sm:h-12 sm:px-12 font-medium dark:text-white bg-[#A51C21] hover:bg-[#A51C21]/90"
                onClick={form.handleSubmit(onSubmit)}
              >
                Add
              </Pecha.Button>
            </div>
          </div>
        </Pecha.Form>
      </div>
    </div>
  );
};

export default CreateSeries;