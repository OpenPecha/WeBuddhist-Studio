import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlanOptions } from "@/components/routes/tags/api/tagsApi";
import { searchSeries } from "../api/seriesSearchApi";

export type LinkedItem = { id: string; title: string };

export function useGroupLinkedTitles(
  planIds: string[] | undefined,
  seriesIds: string[] | undefined,
) {
  const { data: planOptions = [] } = useQuery({
    queryKey: ["cms-plans-options"],
    queryFn: fetchPlanOptions,
    enabled: Boolean(planIds?.length),
    refetchOnWindowFocus: false,
  });

  const { data: seriesSearch } = useQuery({
    queryKey: ["group-series-options"],
    queryFn: () => searchSeries({ limit: 500 }),
    enabled: Boolean(seriesIds?.length),
    refetchOnWindowFocus: false,
  });

  const linkedPlans = useMemo((): LinkedItem[] => {
    const map = new Map(planOptions.map((p) => [p.id, p.title]));
    return (planIds ?? []).map((id) => ({ id, title: map.get(id) ?? id }));
  }, [planIds, planOptions]);

  const linkedSeries = useMemo((): LinkedItem[] => {
    const map = new Map(
      (seriesSearch?.series ?? []).map((s) => [s.id, s.title]),
    );
    return (seriesIds ?? []).map((id) => ({ id, title: map.get(id) ?? id }));
  }, [seriesIds, seriesSearch?.series]);

  return { linkedPlans, linkedSeries, planOptions, seriesSearch };
}
