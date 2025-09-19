import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/atoms/form";
import { Input } from "@/components/ui/atoms/input";
import { Button } from "@/components/ui/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/atoms/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/atoms/textarea";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { planSchema } from "@/schema/PlanSchema";
import { z } from "zod";
import { useTranslate } from "@tolgee/react";
import TagInput from "@/components/ui/molecules/tag-input/TagInput";
import { DIFFICULTY, BACKEND_BASE_URL } from "@/lib/constant";
import axiosInstance from "@/config/axios-config";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/atoms/dialog";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";

export const UploadImageToS3 = async (file: File, plan_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post(
    `${BACKEND_BASE_URL}/api/v1/cms/media/upload`,
    formData,
    {
      params: {
        ...(plan_id && { plan_id: plan_id }),
      },
    },
  );
  return data;
};

export const callplan = async (formdata: z.infer<typeof planSchema>) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `${BACKEND_BASE_URL}/api/v1/cms/plans`,
    formdata,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};
const Createplan = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const { plan_id } = useParams();
  const { t } = useTranslate();
  type PlanFormData = z.infer<typeof planSchema>;
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      description: "",
      total_days: "",
      difficulty_level: "",
      image_url: "",
      tags: [],
      language: "",
    },
  });

  const hasUnsavedChanges =
    form.formState.isDirty && !form.formState.isSubmitSuccessful;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );
  const createPlanMutation = useMutation({
    mutationFn: callplan,
    onSuccess: (data) => {
      toast.success("Plan created successfully!", {
        description: "Your plan has been created and is now available.",
      });
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      navigate(`/create-plan/${data.id}/plan-details`);
    },
    onError: (error) => {
      toast.error("Failed to create plan", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowNavigationDialog(true);
    }
  }, [blocker.state]);

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue("image_url", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmNavigation = () => {
    setShowNavigationDialog(false);
    blocker.proceed?.();
  };

  const handleCancelNavigation = () => {
    setShowNavigationDialog(false);
    blocker.reset?.();
  };
  const handleImageUpload = async (file: File) => {
    try {
      const { url, key } = await UploadImageToS3(
        file,
        plan_id === "new" ? "" : plan_id || "",
      );
      const imageUrl = url;
      const imageKey = key;
      setImagePreview(imageUrl);
      setSelectedImage(file);
      form.setValue("image_url", imageKey);
      setIsImageDialogOpen(false);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    }
  };

  const onSubmit = (data: PlanFormData) => {
    const language = localStorage.getItem("language") || "en";
    const planformdata = {
      ...data,
      language: language,
    };
    createPlanMutation.mutate(planformdata);
  };
  return (
    <div className="w-full h-full font-dynamic flex max-sm:flex-col">
      <div className="flex-1 p-10">
        <h1 className="text-xl font-bold my-4">
          {t("studio.plan.form_field.details")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("studio.plan.form.placeholder.title")}
                      className="h-12 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "studio.plan.form.placeholder.description",
                      )}
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.number_of_day")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t(
                        "studio.plan.form.placeholder.number_of_days",
                      )}
                      className="h-12 text-base"
                      min="1"
                      max="365"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-bold">
                {t("studio.dashboard.cover_image")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("studio.plan.cover_image.description")}
              </p>

              <div className="flex gap-4 mt-4 items-start">
                <button
                  type="button"
                  onClick={() => setIsImageDialogOpen(true)}
                  className="border w-48 h-32 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer focus:outline-none"
                  aria-label="Upload cover image"
                >
                  <IoMdAdd className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                </button>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-2">
                      {selectedImage && (
                        <p className="text-xs text-white truncate max-w-32">
                          {selectedImage.name}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className=" text-white cursor-pointer rounded-full p-1 transition-colors ml-2"
                        data-testid="image-remove"
                      >
                        <IoMdClose className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Dialog
              open={isImageDialogOpen}
              onOpenChange={setIsImageDialogOpen}
            >
              <DialogContent showCloseButton={true}>
                <DialogHeader>
                  <DialogTitle>Upload & Crop Image</DialogTitle>
                </DialogHeader>
                <ImageContentData onUpload={handleImageUpload} />
              </DialogContent>
            </Dialog>

            <Dialog
              open={showNavigationDialog}
              onOpenChange={setShowNavigationDialog}
            >
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>
                    {t("studio.plan.navigation.confirm_title")}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    {t("studio.plan.navigation.confirm_message")}
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancelNavigation}>
                    {t("common.button.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmNavigation}
                  >
                    {t("studio.plan.navigation.leave")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </div>

      <div className="flex-1 p-10 sm:mt-9">
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.difficulty")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="h-12"
                        data-testid="select-trigger"
                      >
                        <SelectValue
                          placeholder={t(
                            "studio.plan.form.placeholder.select_difficulty",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIFFICULTY.map((difficulty) => (
                        <SelectItem
                          key={difficulty.value}
                          value={difficulty.value}
                        >
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-8 w-full flex justify-end">
              <Button
                type="submit"
                variant="default"
                className=" h-12 px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
                onClick={form.handleSubmit(onSubmit)}
                disabled={createPlanMutation.isPending}
              >
                {createPlanMutation.isPending
                  ? "Creating..."
                  : t("studio.plan.next_button")}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Createplan;
