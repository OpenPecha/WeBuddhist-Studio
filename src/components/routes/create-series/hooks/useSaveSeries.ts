import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/routes/paths";
import type { SeriesFormData } from "@/schema/SeriesSchema";
import {
  buildSeriesCreateBody,
  buildSeriesUpdateBody,
  mapSeriesDetailToFormData,
  postSeries,
  putUpdateSeries,
  type SeriesDetailDTO,
} from "@/components/routes/create-series/api/seriesApi";

type SaveSeriesInput = { data: SeriesFormData; featured: boolean };

type UseSaveSeriesParams = {
  isNew: boolean;
  seriesId?: string;
  groupId?: string;
  seriesData?: SeriesDetailDTO;
};

export const useSaveSeries = ({
  isNew,
  seriesId,
  groupId,
  seriesData,
}: UseSaveSeriesParams) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, featured }: SaveSeriesInput) => {
      if (isNew) {
        const body = buildSeriesCreateBody(data, featured, groupId);
        const created = await postSeries(body);
        return { id: String(created.id) };
      }
      if (!seriesId || !seriesData) {
        throw new Error("Missing series data for update");
      }
      const body = buildSeriesUpdateBody(data, featured, {
        original: mapSeriesDetailToFormData(seriesData),
        originalFeatured: seriesData.featured,
      });
      await putUpdateSeries({ seriesId, body });
      return { id: seriesId };
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
      if (isNew) {
        toast.success("Series created successfully!");
        navigate(ROUTES.series(result.id));
        return;
      }
      toast.success("Saved");
      void queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
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
};
