import { describe, expect, it } from "vitest";
import { parseRangeBounds, parseSelection } from "./utils";

describe("parseRangeBounds", () => {
  it("parses a range", () => {
    expect(parseRangeBounds("50-60")).toEqual({ start: 50, end: 60 });
  });

  it("parses a single number", () => {
    expect(parseRangeBounds("7")).toEqual({ start: 7, end: 7 });
  });

  it("rejects incomplete ranges", () => {
    expect(parseRangeBounds("50-")).toBeNull();
  });

  it("rejects inverted ranges", () => {
    expect(parseRangeBounds("60-50")).toBeNull();
  });
});

describe("parseSelection", () => {
  it("selects within max", () => {
    expect(Array.from(parseSelection("50-60", 100) ?? [])).toEqual(
      Array.from({ length: 11 }, (_, i) => 50 + i),
    );
  });

  it("rejects start beyond max", () => {
    expect(parseSelection("50-60", 20)).toBeNull();
  });
});
