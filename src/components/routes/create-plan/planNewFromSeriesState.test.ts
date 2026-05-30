import { describe, expect, it } from "vitest";
import { parsePlanNewFromSeriesState } from "./planNewFromSeriesState";

describe("parsePlanNewFromSeriesState", () => {
  it("returns null for missing or partial state", () => {
    expect(parsePlanNewFromSeriesState(null)).toBeNull();
    expect(parsePlanNewFromSeriesState({ seriesId: "s1" })).toBeNull();
    expect(parsePlanNewFromSeriesState({ language: "EN" })).toBeNull();
  });

  it("returns parsed state when seriesId and language are valid", () => {
    expect(
      parsePlanNewFromSeriesState({ seriesId: "series-1", language: "BO" }),
    ).toEqual({ seriesId: "series-1", language: "BO" });
  });

  it("rejects invalid language codes", () => {
    expect(
      parsePlanNewFromSeriesState({ seriesId: "series-1", language: "FR" }),
    ).toBeNull();
  });
});
