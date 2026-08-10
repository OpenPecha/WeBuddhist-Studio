import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isPlaceSearchEnabled,
  reverseGeocode,
  searchPlaces,
  PLACE_SEARCH_MIN_LENGTH,
} from "./placeSearchApi";

const mockFetch = (body: unknown, ok = true, status = 200) => {
  const spy = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", spy);
  return spy;
};

const withToken = (token = "test-token") => {
  vi.stubEnv("VITE_LOCATIONIQ_TOKEN", token);
};

beforeEach(() => {
  withToken();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isPlaceSearchEnabled", () => {
  it("is enabled when a token is configured", () => {
    expect(isPlaceSearchEnabled()).toBe(true);
  });

  it("is disabled when the token is missing", () => {
    vi.stubEnv("VITE_LOCATIONIQ_TOKEN", "");
    expect(isPlaceSearchEnabled()).toBe(false);
  });
});

describe("searchPlaces", () => {
  it("serves a repeated query from cache without a second request", async () => {
    const spy = mockFetch([
      {
        place_id: "1",
        display_name: "Pokhara, Kaski, Nepal",
        lat: "28.2",
        lon: "83.9",
      },
    ]);

    const first = await searchPlaces("cached pokhara");
    const second = await searchPlaces("cached pokhara");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("matches the cache regardless of case", async () => {
    const spy = mockFetch([
      {
        place_id: "1",
        display_name: "Lumbini, Nepal",
        lat: "27.4",
        lon: "83.2",
      },
    ]);

    await searchPlaces("Lumbini Garden");
    await searchPlaces("lumbini garden");

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("parses coordinates into numbers", async () => {
    mockFetch([
      {
        place_id: "1",
        display_name: "Tushita, Dharamkot, Himachal Pradesh, India",
        display_place: "Tushita",
        display_address: "Dharamkot, Himachal Pradesh, India",
        lat: "32.242305",
        lon: "76.321284",
      },
    ]);

    const [place] = await searchPlaces("tushita coords");
    expect(place.latitude).toBe(32.242305);
    expect(place.longitude).toBe(76.321284);
    expect(typeof place.latitude).toBe("number");
  });

  it("prefers display_place and display_address for the two lines", async () => {
    mockFetch([
      {
        place_id: "1",
        display_name: "Tushita, Dharamkot, Himachal Pradesh, India",
        display_place: "Tushita",
        display_address: "Dharamkot, Himachal Pradesh, India",
        lat: "32.2",
        lon: "76.3",
      },
    ]);

    const [place] = await searchPlaces("tushita labels");
    expect(place.primary).toBe("Tushita");
    expect(place.secondary).toBe("Dharamkot, Himachal Pradesh, India");
  });

  it("falls back to splitting display_name", async () => {
    mockFetch([
      {
        place_id: "1",
        display_name: "Pokhara, Kaski, Nepal",
        lat: "28.2",
        lon: "83.9",
      },
    ]);

    const [place] = await searchPlaces("pokhara fallback");
    expect(place.primary).toBe("Pokhara");
    expect(place.secondary).toBe("Kaski, Nepal");
  });

  it("keeps a result at 0/0", async () => {
    mockFetch([
      {
        place_id: "1",
        display_name: "Null Island",
        lat: "0",
        lon: "0",
      },
    ]);

    const results = await searchPlaces("null island");
    expect(results[0].latitude).toBe(0);
    expect(results[0].longitude).toBe(0);
  });

  it("drops rows with unparseable coordinates", async () => {
    mockFetch([
      { place_id: "1", display_name: "Bad", lat: "abc", lon: "1" },
      { place_id: "2", display_name: "Good", lat: "1", lon: "2" },
    ]);

    const results = await searchPlaces("place");
    expect(results).toHaveLength(1);
    expect(results[0].primary).toBe("Good");
  });

  it("does not call the API below the minimum query length", async () => {
    const spy = mockFetch([]);
    const short = "a".repeat(PLACE_SEARCH_MIN_LENGTH - 1);
    expect(await searchPlaces(short)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not call the API when no token is configured", async () => {
    vi.stubEnv("VITE_LOCATIONIQ_TOKEN", "");
    const spy = mockFetch([]);
    expect(await searchPlaces("pokhara no token")).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("treats 404 as an empty result rather than an error", async () => {
    mockFetch({ error: "Unable to geocode" }, false, 404);
    await expect(searchPlaces("zzzzzz")).resolves.toEqual([]);
  });

  it("throws when the service rate limits", async () => {
    mockFetch({}, false, 429);
    await expect(searchPlaces("busy")).rejects.toThrow("429");
  });

  it("sends the token and a bounded limit", async () => {
    const spy = mockFetch([]);
    await searchPlaces("pokhara params");
    const url = String(spy.mock.calls[0][0]);
    expect(url).toContain("key=test-token");
    expect(url).toContain("q=pokhara");
    expect(url).toContain("limit=8");
  });
});

describe("reverseGeocode", () => {
  it("returns the place name for a pin", async () => {
    mockFetch({
      place_id: "1",
      display_name: "Lakeside, Pokhara, Kaski, Nepal",
      display_place: "Lakeside",
      display_address: "Pokhara, Kaski, Nepal",
      lat: "28.21",
      lon: "83.95",
    });

    expect(await reverseGeocode(28.21, 83.95)).toBe("Lakeside");
  });

  it("caches by rounded coordinates so small drags cost nothing", async () => {
    const spy = mockFetch({
      place_id: "1",
      display_name: "Boudha, Kathmandu, Nepal",
      lat: "27.7215",
      lon: "85.3620",
    });

    await reverseGeocode(27.7215, 85.362);
    await reverseGeocode(27.72151, 85.36201);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns null when no token is configured", async () => {
    vi.stubEnv("VITE_LOCATIONIQ_TOKEN", "");
    const spy = mockFetch({});
    expect(await reverseGeocode(1.5, 2.5)).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns null when nothing is found there", async () => {
    mockFetch({ error: "Unable to geocode" }, false, 404);
    expect(await reverseGeocode(41.1, 42.2)).toBeNull();
  });

  it("throws when the service rate limits", async () => {
    mockFetch({}, false, 429);
    await expect(reverseGeocode(51.5, 0.12)).rejects.toThrow("429");
  });

  it("works at 0/0", async () => {
    mockFetch({
      place_id: "1",
      display_name: "Null Island",
      lat: "0",
      lon: "0",
    });

    expect(await reverseGeocode(0, 0)).toBe("Null Island");
  });
});

describe("searchPlaces abort handling", () => {
  it("rejects with the abort reason when the signal is already aborted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url, init) => {
        if (init?.signal?.aborted) {
          return Promise.reject(new DOMException("Aborted", "AbortError"));
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => [] });
      }),
    );

    const controller = new AbortController();
    controller.abort();

    await expect(
      searchPlaces("aborted query", controller.signal),
    ).rejects.toThrow();
  });

  it("does not poison the cache when a request fails", async () => {
    mockFetch({}, false, 500);
    await expect(searchPlaces("flaky place")).rejects.toThrow("500");

    mockFetch([
      {
        place_id: "9",
        display_name: "Flaky Place, Somewhere",
        lat: "1",
        lon: "2",
      },
    ]);
    const results = await searchPlaces("flaky place");
    expect(results).toHaveLength(1);
  });
});
