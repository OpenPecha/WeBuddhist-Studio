import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/routes/paths";
import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";
import { useGroupContentPermissions } from "@/hooks/useGroupContentPermissions";
import { canWriteCms } from "@/lib/platformAccess";
import { useSeriesForm } from "@/components/routes/create-series/hooks/useSeriesForm";
import { useSeriesImage } from "@/components/routes/create-series/hooks/useSeriesImage";
import { useSaveSeries } from "@/components/routes/create-series/hooks/useSaveSeries";
import {
  getSeries,
  mapSeriesDetailToFormData,
} from "@/components/routes/create-series/api/seriesApi";
import { resolveDashboardItemImageUrl } from "@/components/routes/dashboard/dashboardTable";

export const useCreateSeriesController = () => {
  const { seriesId, groupId } = useParams<{
    seriesId?: string;
    groupId?: string;
  }>();
  const navigate = useNavigate();
  const isNew = !seriesId;

  useEffect(() => {
    if (isNew && !groupId) {
      navigate(ROUTES.groups, { replace: true });
    }
  }, [isNew, groupId, navigate]);

  const seriesForm = useSeriesForm();
  const { form, languages, setImageUrl } = seriesForm;

  const seriesQuery = useQuery({
    queryKey: ["series", seriesId],
    queryFn: () => getSeries(seriesId ?? ""),
    enabled: Boolean(seriesId) && !isNew,
    refetchOnWindowFocus: false,
  });
  const seriesData = seriesQuery.data;

  const seriesGroupId = groupId ?? seriesData?.group_id ?? undefined;
  const seriesStatus = isNew ? "DRAFT" : (seriesData?.status ?? "DRAFT");
  const {
    userInfo,
    groupRole,
    platformReadOnly,
    canEdit: canEditSeries,
  } = useGroupContentPermissions(seriesGroupId, seriesStatus);

  const canSaveSeries =
    !platformReadOnly &&
    (isNew
      ? Boolean(seriesGroupId) &&
        canWriteCms(userInfo) &&
        groupRole != null &&
        groupRole !== "VIEWER"
      : canEditSeries);

  const formReadOnly = !canSaveSeries;

  const image = useSeriesImage({ isNew, seriesId, setImageUrl });
  const { setImagePreview, setSelectedImage } = image;

  const [activePlansLanguage, setActivePlansLanguage] =
    useState<LanguageCode | null>(null);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);

  const seriesHydratedIdRef = useRef<string | null>(null);
  useEffect(() => {
    seriesHydratedIdRef.current = null;
  }, [seriesId]);

  useEffect(() => {
    if (isNew || !seriesData) return;
    if (seriesHydratedIdRef.current === seriesData.id) return;
    seriesHydratedIdRef.current = seriesData.id;
    form.reset(mapSeriesDetailToFormData(seriesData));
    const resolvedImageUrl = resolveDashboardItemImageUrl({
      image_url: seriesData.image_url,
      image_key: seriesData.image_key,
      image: seriesData.image,
    });
    setImagePreview(resolvedImageUrl || null);
    setSelectedImage(null);
  }, [isNew, seriesData, form, setImagePreview, setSelectedImage]);

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

  const hasUnsavedChanges =
    form.formState.isDirty && !form.formState.isSubmitSuccessful;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowNavigationDialog(true);
    }
  }, [blocker.state]);

  const saveSeriesMutation = useSaveSeries({
    isNew,
    seriesId,
    groupId,
    seriesData,
    onCreated: () => {
      form.reset({ languages: {}, plans: {}, image_url: "" });
      setSelectedImage(null);
      setImagePreview(null);
      setActivePlansLanguage(null);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (formReadOnly) return;
    const featured = isNew ? false : (seriesData?.featured ?? false);
    saveSeriesMutation.mutate({ data, featured });
  });

  const confirmNavigation = () => {
    setShowNavigationDialog(false);
    blocker.proceed?.();
  };

  const cancelNavigation = () => {
    setShowNavigationDialog(false);
    blocker.reset?.();
  };

  const submitEnabled =
    seriesForm.canSubmit &&
    !saveSeriesMutation.isPending &&
    seriesForm.imageUrl.trim().length > 0 &&
    (isNew || !!seriesData);

  const saveDisabled =
    formReadOnly || !submitEnabled || (!isNew && !form.formState.isDirty);

  const getSaveLabel = () => {
    if (saveSeriesMutation.isPending) {
      return isNew ? "Creating…" : "Saving…";
    }
    return isNew ? "Create series" : "Save changes";
  };
  const saveLabel = getSaveLabel();

  return {
    isNew,
    navigate,
    seriesForm,
    seriesGroupId,
    formReadOnly,
    platformReadOnly,
    image,
    orderedAddedLanguages,
    activePlansLanguage,
    setActivePlansLanguage,
    showNavigationDialog,
    setShowNavigationDialog,
    isSeriesLoading: seriesQuery.isLoading,
    isSeriesError: seriesQuery.isError,
    seriesError: seriesQuery.error,
    onSubmit,
    confirmNavigation,
    cancelNavigation,
    saveDisabled,
    saveLabel,
  };
};
