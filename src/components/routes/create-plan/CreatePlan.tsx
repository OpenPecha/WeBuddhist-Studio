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
import { DIFFICULTY } from "@/lib/constant";
import axiosInstance from "@/config/axios-config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";

export const UploadImageToS3 = async (file: File, plan_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post(
    `/api/v1/cms/media/upload`,
    formData,
    {
      params: {
        ...(plan_id && { plan_id: plan_id }),
      },
    },
  );
  return data;
};
export const getPlan = async (plan_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};
export const updatePlan = async ({
  plan_id,
  formdata,
}: {
  plan_id: string;
  formdata: z.infer<typeof planSchema>;
}) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.put(
    `/api/v1/cms/plans/${plan_id}`,
    formdata,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};
export const postPlan = async (formdata: z.infer<typeof planSchema>) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(`/api/v1/cms/plans`, formdata, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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

  const { data: planData } = useQuery({
    queryKey: ["plan", plan_id],
    queryFn: () => getPlan(plan_id!),
    enabled: !!plan_id && plan_id !== "new",
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (plan_id !== "new" && planData) {
      form.reset({
        title: planData.title || "",
        description: planData.description || "",
        total_days: planData.total_days?.toString() || "",
        difficulty_level: planData.difficulty_level || "",
        image_url: planData.plan_image_url || "",
        tags: planData.tags || [],
        language: planData.language || "",
      });
      setImagePreview(planData.image_url ? `${planData.image_url}` : null);
    }
  }, [plan_id, planData]);

  const hasUnsavedChanges =
    form.formState.isDirty && !form.formState.isSubmitSuccessful;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );
  const createPlanMutation = useMutation({
    mutationFn: postPlan,
    onSuccess: (data) => {
      toast.success("Plan created successfully!", {
        description: "Your plan has been created and is now available.",
      });
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      navigate(`/plan/${data.id}/plan-details`);
    },
    onError: (error) => {
      toast.error("Failed to create plan", {
        description: error.message,
      });
    },
  });
  const updatePlanMutation = useMutation({
    mutationFn: updatePlan,
    onSuccess: (_) => {
      toast.success("Plan updated successfully!", {
        description: "Your plan has been updated and is now available.",
      });
    },
    onError: (error) => {
      toast.error("Failed to update plan", {
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
    if (plan_id !== "new") {
      updatePlanMutation.mutate({ plan_id: plan_id!, formdata: planformdata });
    } else {
      createPlanMutation.mutate(planformdata);
    }
  };
  return (
    <div className="w-full h-full font-dynamic flex max-sm:flex-col">
      <div className="flex-1 p-10">
        <h1 className="text-xl font-bold my-4">
          {t("studio.plan.form_field.details")}
        </h1>

        <Pecha.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Pecha.FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormControl>
                    <Pecha.Input
                      placeholder={t("studio.plan.form.placeholder.title")}
                      className="h-12 text-base"
                      {...field}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormControl>
                    <Textarea
                      placeholder={t(
                        "studio.plan.form.placeholder.description",
                      )}
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...field}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.FormField
              control={form.control}
              name="total_days"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.number_of_day")}
                  </Pecha.FormLabel>
                  <Pecha.FormControl>
                    <Pecha.Input
                      type="number"
                      disabled={plan_id !== "new"}
                      placeholder={t(
                        "studio.plan.form.placeholder.number_of_days",
                      )}
                      className="h-12 text-base"
                      min="1"
                      max="365"
                      {...field}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
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
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={() => setIsImageDialogOpen(true)}
                    className="border w-48 h-32 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer focus:outline-none"
                    aria-label="Upload cover image"
                  >
                    <IoMdAdd className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  </button>
                )}

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

            <Pecha.Dialog
              open={showNavigationDialog}
              onOpenChange={setShowNavigationDialog}
            >
              <Pecha.DialogContent showCloseButton={false}>
                <Pecha.DialogHeader>
                  <Pecha.DialogTitle>
                    {t("studio.plan.navigation.confirm_title")}
                  </Pecha.DialogTitle>
                </Pecha.DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    {t("studio.plan.navigation.confirm_message")}
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Pecha.Button
                    variant="outline"
                    onClick={handleCancelNavigation}
                  >
                    {t("common.button.cancel")}
                  </Pecha.Button>
                  <Pecha.Button
                    variant="destructive"
                    onClick={handleConfirmNavigation}
                  >
                    {t("studio.plan.navigation.leave")}
                  </Pecha.Button>
                </div>
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
              name="difficulty_level"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.difficulty")}
                  </Pecha.FormLabel>
                  <Pecha.Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <Pecha.FormControl>
                      <Pecha.SelectTrigger
                        className="h-12"
                        data-testid="select-trigger"
                      >
                        <Pecha.SelectValue
                          placeholder={t(
                            "studio.plan.form.placeholder.select_difficulty",
                          )}
                        />
                      </Pecha.SelectTrigger>
                    </Pecha.FormControl>
                    <Pecha.SelectContent>
                      {DIFFICULTY.map((difficulty) => (
                        <Pecha.SelectItem
                          key={difficulty.value}
                          value={difficulty.value}
                        >
                          {difficulty.label}
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
              name="tags"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormControl>
                    <TagInput value={field.value} onChange={field.onChange} />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />
            <div className="pt-8 w-full flex justify-end">
              {plan_id == "new" ? (
                <Pecha.Button
                  type="submit"
                  variant="default"
                  className=" h-12 px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending
                    ? "Creating..."
                    : t("studio.plan.next_button")}
                </Pecha.Button>
              ) : (
                <div className="flex gap-3">
                  <Pecha.Button
                    type="button"
                    variant="outline"
                    className=" h-12 px-12 font-medium"
                    onClick={() => navigate(`/dashboard`)}
                  >
                    {t("common.button.cancel")}
                  </Pecha.Button>

                  <Pecha.Button
                    type="submit"
                    variant="default"
                    className=" h-12 px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updatePlanMutation.isPending || !form.formState.isDirty}
                  >
                    {updatePlanMutation.isPending
                      ? "Updating..."
                      : t("studio.plan.update_button")}
                  </Pecha.Button>
                </div>
              )}
            </div>
          </div>
        </Pecha.Form>
      </div>
    </div>
  );
};

export default Createplan;
