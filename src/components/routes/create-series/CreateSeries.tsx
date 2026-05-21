import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/atoms/tooltip";
import ImageContentData from "@/components/ui/molecules/modals/image-upload/ImageContentData";
import { uploadImageToS3 } from "@/components/routes/task/api/taskApi";
import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";
import { useSeriesForm } from "@/components/routes/create-series/hooks/useSeriesForm";
import PlanSearchSelector from "@/components/routes/create-series/components/PlanSearchSelector";
import {
  buildSeriesUpdateBody,
  getSeries,
  mapSeriesDetailToFormData,
  postSeries,
  putUpdateSeries,
} from "@/components/routes/create-series/api/seriesApi";
import type { SeriesFormData } from "@/schema/SeriesSchema";

const CreateSeries = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslate();
  const isNew = !seriesId;
  const {
    form,
    languages,
    plans,
    imageUrl,
    addedLanguages,
    availableLanguages,
    canSubmit,
    addLanguage,
    removeLanguage,
    setImageUrl,
  } = useSeriesForm();

  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    isError: isSeriesError,
    error: seriesError,
  } = useQuery({
    queryKey: ["series", seriesId],
    queryFn: () => getSeries(seriesId!),
    enabled: Boolean(seriesId) && !isNew,
    refetchOnWindowFocus: false,
  });

  const seriesHydratedIdRef = useRef<string | null>(null);

  useEffect(() => {
    seriesHydratedIdRef.current = null;
  }, [seriesId]);

  useEffect(() => {
    if (isNew || !seriesData) return;
    if (seriesHydratedIdRef.current === seriesData.id) return;
    seriesHydratedIdRef.current = seriesData.id;
    form.reset(mapSeriesDetailToFormData(seriesData));
    setImagePreview(seriesData.image || null);
    setSelectedImage(null);
  }, [isNew, seriesData, form]);

  const [activePlansLanguage, setActivePlansLanguage] =
    useState<LanguageCode | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderedAddedLanguages = useMemo(
    () =>
      PLAN_LANGUAGE.map((l) => l.value as LanguageCode).filter(
        (code) => languages[code] != null,
      ),
    [languages],
  );

  useEffect(() => {
    if (orderedAddedLanguages.length === 0) {
      setActivePlansLanguage(null);
      return;
    }
    if (
      activePlansLanguage == null ||
      !orderedAddedLanguages.includes(activePlansLanguage)
    ) {
      setActivePlansLanguage(orderedAddedLanguages[0]);
    }
  }, [orderedAddedLanguages, activePlansLanguage]);

  const canUpdate = form.formState.isDirty;
  const hasUnsavedChanges = canUpdate && !form.formState.isSubmitSuccessful;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowNavigationDialog(true);
    }
  }, [blocker.state]);

  const saveSeriesMutation = useMutation({
    mutationFn: async (input: { data: SeriesFormData; featured: boolean }) => {
      const body = buildSeriesUpdateBody(input.data, input.featured);
      if (isNew) {
        const created = await postSeries(body);
        return { id: String(created.id) };
      }
      await putUpdateSeries({
        seriesId: seriesId!,
        body,
      });
      return { id: seriesId! };
    },
    onSuccess: () => {
      toast.success(
        isNew ? "Series created successfully!" : "Series updated successfully!",
      );
      void queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
      if (seriesId && !isNew) {
        void queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
      }
      if (isNew) {
        form.reset({ languages: {}, plans: {}, image_url: "" });
        setSelectedImage(null);
        setImagePreview(null);
        setActivePlansLanguage(null);
      }
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(
        isNew ? "Failed to create series" : "Failed to update series",
        {
          description: error.message,
        },
      );
    },
  });

  const handleConfirmNavigation = () => {
    setShowNavigationDialog(false);
    blocker.proceed?.();
  };

  const handleCancelNavigation = () => {
    setShowNavigationDialog(false);
    blocker.reset?.();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      const { image, key } = await uploadImageToS3(
        file,
        isNew ? "" : seriesId || "",
      );
      const imageUrlUploaded = image.original;
      setImagePreview(imageUrlUploaded);
      setSelectedImage(file);
      setImageUrl(key);
      setIsImageDialogOpen(false);
      toast.success("Image uploaded successfully!");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 413) {
        toast.error("Failed to upload image", {
          description: "File exceeds the maximum size of 1MB",
        });
      } else {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image");
      }
    } finally {
      setIsImageUploading(false);
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    const featured = isNew ? false : (seriesData?.featured ?? false);
    saveSeriesMutation.mutate({ data, featured });
  });

  if (!isNew && isSeriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        Loading series…
      </div>
    );
  }

  if (!isNew && isSeriesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 gap-4">
        <p className="text-destructive text-center">
          {(seriesError as Error)?.message || "Could not load this series."}
        </p>
        <Pecha.Button variant="outline" onClick={() => navigate("/dashboard")}>
          {t("common.button.cancel")}
        </Pecha.Button>
      </div>
    );
  }

  const submitEnabled =
    canSubmit &&
    !saveSeriesMutation.isPending &&
    imageUrl.trim().length > 0 &&
    (isNew || !!seriesData);

  const saveDisabled = !submitEnabled || (!isNew && !form.formState.isDirty);

  const saveLabel = saveSeriesMutation.isPending
    ? isNew
      ? "Creating…"
      : "Saving…"
    : isNew
      ? "Create series"
      : "Save changes";

  return (
    <div className="flex flex-col lg:flex-row border h-[calc(100vh-40px)] overflow-auto bg-[#F3F3F3] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="flex-1 p-4 sm:p-10 border-b lg:border-b-0 border-border">
        <h1 className="text-xl font-bold my-4 border-b border-dashed border-black dark:border-white">
          {isNew ? "Series details" : "Series Edit"}
        </h1>

        <Pecha.Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              {orderedAddedLanguages.map((code) => {
                const label =
                  code === "EN"
                    ? "English"
                    : code === "BO"
                      ? "Tibetan"
                      : code === "ZH"
                        ? "Chinese"
                        : code;

                return (
                  <div
                    key={code}
                    className="relative rounded-lg border border-input bg-[#FAFAFA] dark:bg-[#262626] p-4 space-y-3"
                  >
                    <button
                      type="button"
                      onClick={() => removeLanguage(code)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded"
                      aria-label={`Remove ${label}`}
                    >
                      <IoMdClose className="h-4 w-4" />
                    </button>
                    <Pecha.FormField
                      control={form.control}
                      name={`languages.${code}.title`}
                      render={({ field }) => (
                        <Pecha.FormItem>
                          <Pecha.FormLabel className="text-sm font-bold">
                            {label} title
                          </Pecha.FormLabel>
                          <Pecha.FormControl>
                            <Pecha.Input
                              placeholder={`Title in ${label}`}
                              className="h-12 text-base bg-white dark:bg-[#181818]"
                              {...field}
                            />
                          </Pecha.FormControl>
                          <Pecha.FormMessage />
                        </Pecha.FormItem>
                      )}
                    />

                    <Pecha.FormField
                      control={form.control}
                      name={`languages.${code}.description`}
                      render={({ field }) => (
                        <Pecha.FormItem>
                          <Pecha.FormLabel className="text-sm font-bold">
                            {label} description
                          </Pecha.FormLabel>
                          <Pecha.FormControl>
                            <Textarea
                              placeholder={`Description in ${label}`}
                              className="min-h-[100px] w-full rounded-md border border-input bg-white dark:bg-[#181818] px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none resize-none"
                              {...field}
                            />
                          </Pecha.FormControl>
                          <Pecha.FormMessage />
                        </Pecha.FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {availableLanguages.length > 0 ? (
              <Pecha.Select
                key={addedLanguages.join(",")}
                onValueChange={(v) => addLanguage(v as LanguageCode)}
              >
                <Pecha.SelectTrigger className="h-11 w-fit max-w-md border-dashed bg-white dark:bg-[#262626]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IoMdAdd className="h-5 w-5" />
                    <Pecha.SelectValue
                      className="text-[#1A1A1A] font-semibold text-sm"
                      placeholder="Add series details"
                    />
                  </div>
                </Pecha.SelectTrigger>
                <Pecha.SelectContent>
                  {availableLanguages.map((lang) => (
                    <Pecha.SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </Pecha.SelectItem>
                  ))}
                </Pecha.SelectContent>
              </Pecha.Select>
            ) : null}

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <h3 className="text-sm font-bold">
                  {t("studio.dashboard.cover_image")}
                </h3>
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
                <p className="text-sm sm:hidden text-muted-foreground whitespace-pre-line">
                  {t("studio.plan.cover_image.constraints")}
                </p>
              </div>
              <div className="flex gap-4 mt-2 items-start">
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={() => setIsImageDialogOpen(true)}
                    className="border w-56 h-40 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer focus:outline-none bg-#C7C7C7 dark:bg-[#262626]"
                    aria-label="Upload cover image"
                  >
                    <IoMdAdd className="h-10 w-10 text-gray-400" />
                  </button>
                )}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-48 h-48 object-cover rounded-lg border"
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
                        className="text-white cursor-pointer rounded-full p-1 transition-colors ml-auto"
                        data-testid="image-remove"
                      >
                        <IoMdClose className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input type="hidden" {...form.register("image_url")} />
              {form.formState.errors.image_url && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.image_url.message}
                </p>
              )}
            </div>

            <Pecha.Dialog
              open={isImageDialogOpen}
              onOpenChange={setIsImageDialogOpen}
            >
              <Pecha.DialogContent showCloseButton={true}>
                <Pecha.DialogHeader>
                  <Pecha.DialogTitle>Upload &amp; crop image</Pecha.DialogTitle>
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

      <div className="flex-1 p-4 sm:p-10 flex flex-col min-h-0">
        <h2 className="text-lg font-bold mb-2">Included plans</h2>

        {orderedAddedLanguages.length === 0 ? (
          <div className="flex-1 rounded-md border border-dashed border-muted-foreground/40 p-8 text-center text-sm text-muted-foreground">
            Add at least one language on the left to attach plans.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 border-b border-border mb-4">
              {orderedAddedLanguages.map((code) => {
                const label =
                  PLAN_LANGUAGE.find((l) => l.value === code)?.label ?? code;
                const count = plans[code]?.length ?? 0;
                const isActive = activePlansLanguage === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActivePlansLanguage(code)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      isActive
                        ? "border-[#B82E2E] text-[#B82E2E] font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[#737373]"> ({count})</span>
                  </button>
                );
              })}
            </div>

            {activePlansLanguage != null && (
              <PlanSearchSelector
                value={plans[activePlansLanguage] ?? []}
                onChange={(next) => {
                  const current = form.getValues("plans") ?? {};
                  form.setValue(
                    "plans",
                    { ...current, [activePlansLanguage]: next },
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
                searchLanguage={activePlansLanguage}
              />
            )}
          </>
        )}

        <div className="mt-auto pt-8 flex justify-end gap-3">
          <Pecha.Button
            type="button"
            variant="outline"
            className="sm:h-12 sm:px-8"
            onClick={() => navigate("/dashboard")}
          >
            {t("common.button.cancel")}
          </Pecha.Button>

          <Pecha.Button
            type="button"
            variant="default"
            disabled={saveDisabled}
            className="sm:h-12 sm:px-12 font-medium dark:text-white bg-[#A51C21] hover:bg-[#A51C21]/90 disabled:opacity-50"
            onClick={onSubmit}
          >
            {saveLabel}
          </Pecha.Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSeries;
