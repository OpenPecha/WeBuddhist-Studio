import { describe, expect, it } from "vitest";
import { formatCoordinates, hasCoordinates } from "./locationsApi";

describe("hasCoordinates", () => {
  it("accepts 0/0 — Null Island is a real place", () => {
    expect(hasCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
  });

  it("rejects a location with no coordinates", () => {
    expect(hasCoordinates({})).toBe(false);
  });

  it("rejects a half-set pair", () => {
    expect(hasCoordinates({ latitude: 32.2 })).toBe(false);
  });
});

describe("formatCoordinates", () => {
  it("formats 0/0 rather than treating it as absent", () => {
    expect(formatCoordinates({ latitude: 0, longitude: 0 }, 1)).toBe(
      "0.0, 0.0",
    );
  });

  it("returns null when coordinates are absent", () => {
    expect(formatCoordinates({})).toBeNull();
  });
});
