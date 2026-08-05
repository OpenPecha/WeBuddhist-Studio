import { describe, expect, it } from "vitest";
import {
  buildUpdateLocationBody,
  formatCoordinates,
  getLocationInUseError,
  hasCoordinates,
} from "./locationsApi";

const original = {
  name: "Tushita Meditation Centre",
  latitude: 32.242305,
  longitude: 76.321284,
};

describe("buildUpdateLocationBody", () => {
  it("omits everything when nothing changed", () => {
    const body = buildUpdateLocationBody(
      { name: original.name, latitude: 32.242305, longitude: 76.321284 },
      original,
    );
    expect(body).toEqual({});
  });

  it("sends only the name when coordinates are untouched", () => {
    const body = buildUpdateLocationBody(
      { name: "New name", latitude: 32.242305, longitude: 76.321284 },
      original,
    );
    expect(body).toEqual({ name: "New name" });
    expect("latitude" in body).toBe(false);
    expect("longitude" in body).toBe(false);
  });

  it("sends both coordinate keys as null to clear them", () => {
    const body = buildUpdateLocationBody(
      { name: original.name, latitude: null, longitude: null },
      original,
    );
    expect(body).toEqual({ latitude: null, longitude: null });
    expect(Object.keys(body).sort()).toEqual(["latitude", "longitude"]);
  });

  it("sends the pair when only one coordinate changed", () => {
    const body = buildUpdateLocationBody(
      { name: original.name, latitude: 10, longitude: 76.321284 },
      original,
    );
    expect(body).toEqual({ latitude: 10, longitude: 76.321284 });
  });

  it("treats 0 as a real coordinate, not as cleared", () => {
    const body = buildUpdateLocationBody(
      { name: original.name, latitude: 0, longitude: 0 },
      original,
    );
    expect(body).toEqual({ latitude: 0, longitude: 0 });
  });

  it("adds coordinates to a name-only location", () => {
    const body = buildUpdateLocationBody(
      { name: "Online", latitude: 1.5, longitude: 2.5 },
      { name: "Online" },
    );
    expect(body).toEqual({ latitude: 1.5, longitude: 2.5 });
  });

  it("trims the name before comparing", () => {
    const body = buildUpdateLocationBody(
      {
        name: "  Tushita Meditation Centre  ",
        latitude: 32.242305,
        longitude: 76.321284,
      },
      original,
    );
    expect(body).toEqual({});
  });
});

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

describe("getLocationInUseError", () => {
  it("reads the event count from a 409 body", () => {
    const err = {
      response: {
        data: {
          detail: {
            error: "LOCATION_IN_USE",
            message: "Location is used by 7 event(s) and cannot be deleted",
            event_count: 7,
          },
        },
      },
    };
    expect(getLocationInUseError(err)?.event_count).toBe(7);
  });

  it("ignores unrelated errors", () => {
    const err = {
      response: { data: { detail: { error: "LOCATION_GROUP_MISMATCH" } } },
    };
    expect(getLocationInUseError(err)).toBeNull();
  });

  it("ignores a plain string detail", () => {
    expect(
      getLocationInUseError({ response: { data: { detail: "nope" } } }),
    ).toBeNull();
  });
});
