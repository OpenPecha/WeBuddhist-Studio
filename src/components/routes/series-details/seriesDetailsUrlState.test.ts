import { describe, expect, it } from "vitest";
import {
  buildSeriesLanguageParams,
  parseSeriesLanguageParam,
} from "./seriesDetailsUrlState";

describe("seriesDetailsUrlState", () => {
  it("defaults to EN when language param is missing or invalid", () => {
    expect(parseSeriesLanguageParam(new URLSearchParams())).toBe("EN");
    expect(parseSeriesLanguageParam(new URLSearchParams("language=xx"))).toBe(
      "EN",
    );
  });

  it("parses a valid language param", () => {
    expect(parseSeriesLanguageParam(new URLSearchParams("language=zh"))).toBe(
      "ZH",
    );
  });

  it("removes language param for EN and sets it for other languages", () => {
    const withZh = buildSeriesLanguageParams(
      new URLSearchParams("language=ZH"),
      "EN",
    );
    expect(withZh.get("language")).toBeNull();

    const withBo = buildSeriesLanguageParams(new URLSearchParams(), "BO");
    expect(withBo.get("language")).toBe("BO");
  });
});
