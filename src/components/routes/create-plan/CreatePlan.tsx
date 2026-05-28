import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import {
  IoCalendarClearOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/atoms/textarea";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { planSchema } from "@/schema/PlanSchema";
import { z } from "zod";
import { useTranslate } from "@tolgee/react";
import PlanTagSearchInput from "./PlanTagSearchInput";
import {
  planTagsToIds,
  type PlanTagSummary,
} from "@/components/routes/tags/api/tagsApi";
import { fetchSeriesList } from "@/components/routes/create-series/api/seriesApi";
import { DIFFICULTY, PLAN_LANGUAGE } from "@/lib/constant";
import { toBackendISO, fromBackendISO, isPastDate } from "@/lib/utils";
import axiosInstance from "@/config/axios-config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { uploadImageToS3 } from "../task/api/taskApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/atoms/tooltip";

const NO_SERIES = "none";

export const getPlan = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`);
  return data;
};

export const updatePlan = async ({
  plan_id,
  formdata,
}: {
  plan_id: string;
  formdata: z.infer<typeof planSchema>;
}) => {
  const { data } = await axiosInstance.put(
    `/api/v1/cms/plans/${plan_id}`,
    formdata,
  );
  return data;
};

export const postPlan = async (formdata: z.infer<typeof planSchema>) => {
  const { data } = await axiosInstance.post(`/api/v1/cms/plans`, formdata);
  return data;
};

const Createplan = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [startDateMode, setStartDateMode] = useState<"enroll" | "specific">(
    "enroll",
  );

  const [isDateOpen, setIsDateOpen] = useState(false);
  const { planId } = useParams<{ planId?: string }>();
  const isCreateMode = !planId;
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
      start_date: null,
      series_id: null,
    },
  });

  const { data: planData } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId!),
    enabled: !!planId,
    refetchOnWindowFocus: false,
  });

  const {
    data: seriesOptions = [],
    isLoading: isSeriesLoading,
    isError: isSeriesError,
  } = useQuery({
    queryKey: ["cms-series-list"],
    queryFn: fetchSeriesList,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSeriesError) {
      toast.error("Couldn't load collections", {
        description:
          "The collection list is unavailable. The plan's current collection won't be changed.",
      });
    }
  }, [isSeriesError]);

  useEffect(() => {
    if (planId && planData) {
      form.reset({
        title: planData.title || "",
        description: planData.description || "",
        total_days: planData.total_days?.toString() || "",
        difficulty_level: planData.difficulty_level || "",
        image_url: planData.plan_image_url || "",
        tags: planTagsToIds(planData.tags),
        language: planData.language || "",
        start_date: planData.start_date || null,
        series_id: planData.series_id ?? null,
      });
      setStartDateMode(planData.start_date ? "specific" : "enroll");
      setImagePreview(planData.image_url ? `${planData.image_url}` : null);
    }
  }, [planId, planData]);

  const canUpdate = form.formState.isDirty;

  const hasUnsavedChanges = canUpdate && !form.formState.isSubmitSuccessful;

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
      navigate(ROUTES.plan(data.id));
    },
    onError: (error) => {
      toast.error("Failed to create plan", {
        description: error.message,
      });
    },
  });
  const updatePlanMutation = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      toast.success("Plan updated successfully!", {
        description: "Your plan has been updated and is now available.",
      });
      navigate(ROUTES.dashboard);
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
    setIsImageUploading(true);
    try {
      const { image, key } = await uploadImageToS3(
        file,
        isCreateMode ? "" : planId || "",
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
    } catch (error: unknown) {
      if (
        (error as { response?: { status?: number } }).response?.status === 413
      ) {
        toast.error("Failed to update Image", {
          description: "file exceeds the maximum size of 1MB",
        });
      } else {
        console.error("Image upload failed:", error as Error);
        toast.error("Failed to upload image");
      }
    } finally {
      setIsImageUploading(false);
    }
  };

  const onSubmit = (data: PlanFormData) => {
    const payload = {
      ...data,
      start_date: startDateMode === "specific" ? data.start_date : null,
    };
    if (planId) {
      if (isSeriesError) {
        const { series_id, ...rest } = payload;
        updatePlanMutation.mutate({ plan_id: planId, formdata: rest });
      } else {
        updatePlanMutation.mutate({ plan_id: planId, formdata: payload });
      }
    } else {
      const { series_id, ...rest } = payload;
      createPlanMutation.mutate(series_id ? { ...rest, series_id } : rest);
    }
  };
  return (
    <div className="flex flex-col sm:flex-row border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="flex-1 p-4 sm:p-10">
        <h1 className="text-xl font-bold my-4">
          Plan {isCreateMode ? "Details" : "Edit"}
        </h1>

        <Pecha.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Pecha.FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.title")}
                  </Pecha.FormLabel>
                  <Pecha.FormControl>
                    <Pecha.Input
                      placeholder={t("studio.plan.form.placeholder.title")}
                      className="h-12 text-base bg-white"
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
                  <Pecha.FormLabel className="text-sm font-bold">
                    {t("studio.plan.form_field.description")}
                  </Pecha.FormLabel>
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
              name="image_url"
              render={({ field }) => (
                <Pecha.FormItem>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <h3 className="text-sm font-bold">
                      {t("studio.dashboard.cover_image")}
                    </h3>

                    {/* Tooltip only on desktop */}
                    <div className="hidden sm:block">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <IoInformationCircleOutline className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>

                          <TooltipContent
                            side="right"
                            className="bg-black text-white text-xs rounded-md px-3 py-2 shadow-md max-w-xs"
                          >
                            <p className="whitespace-pre-line">
                              {t("studio.plan.cover_image.constraints")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* ✅ Mobile only */}
                    <p className="text-sm sm:hidden text-muted-foreground whitespace-pre-line">
                      {t("studio.plan.cover_image.constraints")}
                    </p>
                  </div>
                  <Pecha.FormControl>
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
                              aria-label="Remove image"
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
                      <input type="hidden" {...field} />
                    </div>
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.Dialog
              open={isImageDialogOpen}
              onOpenChange={setIsImageDialogOpen}
            >
              <Pecha.DialogContent showCloseButton={true}>
                <Pecha.DialogHeader>
                  <Pecha.DialogTitle>Upload & Crop Image</Pecha.DialogTitle>
                </Pecha.DialogHeader>
                <ImageContentData
                  onUpload={handleImageUpload}
                  isLoading={isImageUploading}
                />
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
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Pecha.FormField
                control={form.control}
                name="total_days"
                render={({ field }) => (
                  <Pecha.FormItem className="flex-1">
                    <Pecha.FormLabel className="text-sm font-bold">
                      {t("studio.plan.form_field.number_of_day")}
                    </Pecha.FormLabel>
                    <Pecha.FormControl>
                      <Pecha.Input
                        type="number"
                        disabled={!isCreateMode}
                        placeholder={t(
                          "studio.plan.form.placeholder.number_of_days",
                        )}
                        className="h-12 text-base bg-white"
                        min="1"
                        max="365"
                        {...field}
                      />
                    </Pecha.FormControl>
                    <Pecha.FormMessage />
                  </Pecha.FormItem>
                )}
              />
              <Pecha.FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <Pecha.FormItem className="flex-1">
                    <Pecha.FormLabel className="text-sm font-bold">
                      Start Date
                    </Pecha.FormLabel>
                    <Pecha.RadioGroup
                      value={startDateMode}
                      onValueChange={(v) => {
                        const mode = v as "enroll" | "specific";
                        setStartDateMode(mode);
                        if (mode === "enroll") {
                          form.setValue("start_date", null, {
                            shouldDirty: true,
                          });
                        }
                      }}
                      className="gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Pecha.RadioGroupItem
                          value="enroll"
                          id="start-date-enroll"
                        />
                        <label
                          htmlFor="start-date-enroll"
                          className="text-sm cursor-pointer"
                        >
                          When User Enrolls
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pecha.RadioGroupItem
                          value="specific"
                          id="start-date-specific"
                        />
                        <label
                          htmlFor="start-date-specific"
                          className="text-sm cursor-pointer"
                        >
                          On Specific Date
                        </label>
                      </div>
                    </Pecha.RadioGroup>
                    <Pecha.Popover
                      open={isDateOpen}
                      onOpenChange={setIsDateOpen}
                    >
                      <Pecha.PopoverTrigger asChild>
                        <Pecha.Button
                          type="button"
                          variant="outline"
                          disabled={startDateMode !== "specific"}
                          className="h-12 w-full justify-start gap-2 px-3 font-normal rounded-md"
                        >
                          <IoCalendarClearOutline className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              field.value
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {field.value
                              ? format(
                                  fromBackendISO(field.value),
                                  "MMM d, yyyy",
                                )
                              : "Choose Date"}
                          </span>
                        </Pecha.Button>
                      </Pecha.PopoverTrigger>
                      <Pecha.PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <Pecha.Calendar
                          className="cursor-pointer"
                          mode="single"
                          selected={
                            field.value
                              ? fromBackendISO(field.value)
                              : undefined
                          }
                          onSelect={(d) => {
                            setIsDateOpen(false);
                            field.onChange(d ? toBackendISO(d) : null);
                          }}
                          disabled={isPastDate}
                        />
                      </Pecha.PopoverContent>
                    </Pecha.Popover>
                    <Pecha.FormMessage />
                  </Pecha.FormItem>
                )}
              />
            </div>

            <Pecha.FormField
              control={form.control}
              name="series_id"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel className="text-sm font-bold">
                    Collection
                  </Pecha.FormLabel>
                  <Pecha.Select
                    value={field.value ?? NO_SERIES}
                    onValueChange={(v) =>
                      field.onChange(v === NO_SERIES ? null : v)
                    }
                    disabled={isSeriesLoading || isSeriesError}
                  >
                    <Pecha.FormControl>
                      <Pecha.SelectTrigger className="h-12 w-full bg-white">
                        <Pecha.SelectValue
                          placeholder={
                            isSeriesLoading
                              ? "Loading collections…"
                              : isSeriesError
                                ? "Collections unavailable"
                                : "None"
                          }
                        />
                      </Pecha.SelectTrigger>
                    </Pecha.FormControl>
                    <Pecha.SelectContent>
                      <Pecha.SelectItem value={NO_SERIES}>
                        None
                      </Pecha.SelectItem>
                      {seriesOptions.map((series) => (
                        <Pecha.SelectItem key={series.id} value={series.id}>
                          {series.title}
                        </Pecha.SelectItem>
                      ))}
                    </Pecha.SelectContent>
                  </Pecha.Select>
                  {isSeriesError && (
                    <p className="text-sm text-destructive">
                      Couldn't load series. This plan's current series
                      will not be changed.
                    </p>
                  )}
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <Pecha.FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <Pecha.FormItem className="flex-1">
                    <Pecha.FormLabel className="text-sm font-bold">
                      {t("studio.plan.form_field.difficulty")}
                    </Pecha.FormLabel>
                    <Pecha.Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Pecha.FormControl>
                        <Pecha.SelectTrigger
                          className="h-12 w-full bg-white"
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
                name="language"
                render={({ field }) => (
                  <Pecha.FormItem className="flex-1">
                    <Pecha.FormLabel className="text-sm font-bold">
                      {t("studio.plan.form_field.language")}
                    </Pecha.FormLabel>
                    <Pecha.Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Pecha.FormControl>
                        <Pecha.SelectTrigger className="h-12 w-full bg-white">
                          <Pecha.SelectValue
                            placeholder={t(
                              "studio.plan.form.placeholder.select_language",
                            )}
                          />
                        </Pecha.SelectTrigger>
                      </Pecha.FormControl>
                      <Pecha.SelectContent>
                        {PLAN_LANGUAGE.map((planlang) => (
                          <Pecha.SelectItem
                            key={planlang.value}
                            value={planlang.value}
                          >
                            {planlang.label}
                          </Pecha.SelectItem>
                        ))}
                      </Pecha.SelectContent>
                    </Pecha.Select>
                    <Pecha.FormMessage />
                  </Pecha.FormItem>
                )}
              />
            </div>

            <Pecha.FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <Pecha.FormItem>
                  <Pecha.FormControl>
                    <PlanTagSearchInput
                      value={field.value}
                      onChange={field.onChange}
                      planId={planId}
                      initialTags={
                        Array.isArray(planData?.tags)
                          ? planData.tags.filter(
                              (t: unknown): t is PlanTagSummary =>
                                typeof t === "object" &&
                                t !== null &&
                                "id" in t,
                            )
                          : undefined
                      }
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />
            <div className="pt-8 w-full flex justify-end">
              {isCreateMode ? (
                <Pecha.Button
                  type="submit"
                  variant="default"
                  className="sm:h-12 sm:px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
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
                    className="sm:h-12 sm:px-12 font-medium"
                    onClick={() => navigate(ROUTES.dashboard)}
                  >
                    {t("common.button.cancel")}
                  </Pecha.Button>

                  <Pecha.Button
                    type="submit"
                    variant="default"
                    className="sm:h-12 sm:px-12 font-medium dark:text-white  bg-[#A51C21] hover:bg-[#A51C21]/90"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updatePlanMutation.isPending || !canUpdate}
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
