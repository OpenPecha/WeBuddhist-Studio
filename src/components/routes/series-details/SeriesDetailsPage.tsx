import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd, IoMdArrowBack } from "react-icons/io";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";
import { ROUTES } from "@/routes/paths";
import {
  getSeries,
  putSeriesPlans,
} from "@/components/routes/create-series/api/seriesApi";
import PlanSearchSelector from "@/components/routes/create-series/components/PlanSearchSelector";
import type { SeriesPlan } from "@/schema/SeriesSchema";
import { SeriesPlansTable } from "./SeriesPlansTable";
import {
  getLanguageTabCounts,
  getSeriesTitleForLanguage,
  groupPlansByLanguage,
  plansByLanguageToIdMap,
  removePlanFromLanguage,
  reorderPlansInLanguage,
  seriesPlanRowsToSeriesPlans,
  seriesPlansToRows,
} from "./seriesDetailsMappers";
import type { PlansByLanguage } from "./seriesDetailsTypes";

const togglePlanFeatured = async (planId: string) => {
  const { data } = await axiosInstance.patch(
    `/api/v1/cms/plans/${planId}/featured`,
  );
  return data;
};

const SeriesDetailsPage = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("EN");
  const [plansByLang, setPlansByLang] = useState<PlansByLanguage>({});

  const {
    data: seriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["series", seriesId],
    queryFn: () => getSeries(seriesId!),
    enabled: Boolean(seriesId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!seriesData) return;
    setPlansByLang(groupPlansByLanguage(seriesData.plans ?? []));
  }, [seriesData]);

  const tabCounts = useMemo(
    () => getLanguageTabCounts(plansByLang),
    [plansByLang],
  );

  useEffect(() => {
    setActiveLanguage("EN");
  }, [seriesId]);

  const headerTitle = getSeriesTitleForLanguage(
    seriesData?.metadata,
    activeLanguage,
  );

  const activePlans = plansByLang[activeLanguage] ?? [];
  const activeSeriesPlans = useMemo(
    () => seriesPlanRowsToSeriesPlans(activePlans),
    [activePlans],
  );

  const persistPlansMutation = useMutation({
    mutationFn: (grouped: PlansByLanguage) =>
      putSeriesPlans(seriesId!, plansByLanguageToIdMap(grouped)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: { message?: string } } } })
          ?.response?.data?.detail?.message ?? "Could not update series plans";
      toast.error(message);
    },
  });

  const featuredMutation = useMutation({
    mutationFn: togglePlanFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
    },
    onError: () => toast.error("Could not update featured"),
  });

  const applyGrouped = (next: PlansByLanguage) => {
    setPlansByLang(next);
    persistPlansMutation.mutate(next);
  };

  const handleActivePlansChange = (next: SeriesPlan[]) => {
    const nextRows = seriesPlansToRows(next, activeLanguage, activePlans);
    applyGrouped({ ...plansByLang, [activeLanguage]: nextRows });
  };

  const handleRemove = (planId: string) => {
    applyGrouped(removePlanFromLanguage(plansByLang, activeLanguage, planId));
  };

  const handleReorder = (activeId: string, overId: string) => {
    applyGrouped(
      reorderPlansInLanguage(plansByLang, activeLanguage, activeId, overId),
    );
  };

  const tabClass = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold transition-colors ${
      active
        ? "border-[#A51C21] text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  if (!seriesId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-40px)] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-40px)] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{String(error?.message ?? "Error")}</p>
        <Pecha.Button
          variant="outline"
          onClick={() => navigate(ROUTES.dashboard)}
        >
          Back to dashboard
        </Pecha.Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="flex flex-wrap items-center gap-3 border-b border-dashed border-gray-300 px-4 py-4 dark:border-input">
        <Pecha.Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back to dashboard"
          onClick={() => navigate("-1")}
        >
          <IoMdArrowBack className="h-4 w-4" />
        </Pecha.Button>
        <h1 className="text-lg font-semibold">{headerTitle}</h1>
        <Link
          to={ROUTES.seriesEdit(seriesId)}
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          Edit series
        </Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap gap-6">
          {PLAN_LANGUAGE.map(({ label, value }) => {
            const code = value as LanguageCode;
            const count = tabCounts[code] ?? 0;
            return (
              <button
                key={code}
                type="button"
                className={tabClass(activeLanguage === code)}
                onClick={() => setActiveLanguage(code)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        <div className="w-full max-w-md min-w-[280px]">
          <PlanSearchSelector
            value={activeSeriesPlans}
            onChange={handleActivePlansChange}
            searchLanguage={activeLanguage}
            hideSelectedList
            searchPlaceholder="Find Plans to add to series"
          />
        </div>
      </div>

      <div className="flex-1 px-4 pb-6">
        {activePlans.length > 0 ? (
          <div className="overflow-x-auto">
            <SeriesPlansTable
              plans={activePlans}
              seriesId={seriesId}
              onReorder={handleReorder}
              onToggleFeatured={(planId) => featuredMutation.mutate(planId)}
              onRemoveFromSeries={handleRemove}
            />
          </div>
        ) : null}

        <div
          className={`mt-4 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/80 dark:border-input dark:bg-[#1d1d1f]/80 ${
            activePlans.length > 0 ? "py-8" : "py-16"
          }`}
        >
          <Link to={ROUTES.planNew}>
            <Pecha.Button
              type="button"
              className="gap-2 bg-[#A51C21] hover:bg-[#8a171c] text-white"
            >
              <IoMdAdd className="h-4 w-4" />
              Add plan
            </Pecha.Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailsPage;
