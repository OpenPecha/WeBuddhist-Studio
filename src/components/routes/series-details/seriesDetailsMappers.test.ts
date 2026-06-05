import { describe, expect, it } from "vitest";
import {
  groupPlansByLanguage,
  mapPlanDtoToRow,
  plansByLanguageToIdMap,
  reorderPlansInLanguage,
} from "./seriesDetailsMappers";
import type { SeriesPlanDTO } from "@/components/routes/create-series/api/seriesApi";

const plans: SeriesPlanDTO[] = [
  {
    id: "p1",
    title: "Plan 1",
    language: "EN",
    display_order: 2,
  },
  {
    id: "p2",
    title: "Plan 2",
    language: "EN",
    display_order: 1,
  },
  {
    id: "p3",
    title: "Plan ZH",
    language: "ZH",
  },
];

describe("seriesDetailsMappers", () => {
  it("resolves plan cover from nested image object", () => {
    const row = mapPlanDtoToRow({
      id: "p1",
      title: "Plan 1",
      language: "EN",
      image_url: null,
      image: { medium: "https://example.com/cover-medium.jpg" },
    });
    expect(row?.image_url).toBe("https://example.com/cover-medium.jpg");
  });

  it("groups and sorts plans by display_order", () => {
    const grouped = groupPlansByLanguage(plans);
    expect(grouped.EN?.map((p) => p.id)).toEqual(["p2", "p1"]);
    expect(grouped.ZH?.map((p) => p.id)).toEqual(["p3"]);
  });

  it("reorderPlansInLanguage updates id order", () => {
    const grouped = groupPlansByLanguage(plans);
    const next = reorderPlansInLanguage(grouped, "EN", "p1", "p2");
    expect(next.EN?.map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it("plansByLanguageToIdMap preserves order", () => {
    const grouped = groupPlansByLanguage(plans);
    const reordered = reorderPlansInLanguage(grouped, "EN", "p1", "p2");
    expect(plansByLanguageToIdMap(reordered)).toEqual({
      EN: ["p1", "p2"],
      ZH: ["p3"],
    });
  });
});
