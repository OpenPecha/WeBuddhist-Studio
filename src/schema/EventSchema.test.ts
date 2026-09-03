import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIMEZONE,
  defaultEventFormValues,
  emptyMetadataRow,
  eventFormatLabel,
  eventSchema,
  eventEditSchema,
  type EventFormData,
} from "./EventSchema";

const futureDate = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
})();

function baseValidData(overrides: Partial<EventFormData> = {}): EventFormData {
  return {
    ...defaultEventFormValues(),
    start_date: futureDate,
    end_date: futureDate,
    metadata: [emptyMetadataRow("EN")].map((m) => ({ ...m, name: "Event" })),
    ...overrides,
  };
}

describe("eventFormatLabel", () => {
  it("maps each backend value to its display label", () => {
    expect(eventFormatLabel("offline")).toBe("In person");
    expect(eventFormatLabel("online")).toBe("Live");
    expect(eventFormatLabel("hybrid")).toBe("Hybrid");
  });

  it("returns null for an unset or unrecognized value", () => {
    expect(eventFormatLabel(null)).toBeNull();
    expect(eventFormatLabel(undefined)).toBeNull();
    expect(eventFormatLabel("something-else")).toBeNull();
  });
});

describe("defaultEventFormValues", () => {
  it("defaults start_time/end_time to null and timezone to Asia/Kolkata", () => {
    const defaults = defaultEventFormValues();
    expect(defaults.start_time).toBeNull();
    expect(defaults.end_time).toBeNull();
    expect(defaults.timezone).toBe("Asia/Kolkata");
    expect(DEFAULT_TIMEZONE).toBe("Asia/Kolkata");
  });
});

describe("eventSchema start_time/end_time validation", () => {
  it("accepts null start_time/end_time", () => {
    const result = eventSchema.safeParse(
      baseValidData({ start_time: null, end_time: null }),
    );
    expect(result.success).toBe(true);
  });

  it("accepts a valid HH:mm value", () => {
    const result = eventSchema.safeParse(
      baseValidData({ start_time: "06:00", end_time: "23:59" }),
    );
    expect(result.success).toBe(true);
  });

  it("accepts omitted start_time/end_time (optional)", () => {
    const data = baseValidData();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { start_time, end_time, ...rest } = data;
    const result = eventSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it.each(["6:00", "24:00", "12:60", "abc", "12:5", ""])(
    "rejects an invalid HH:mm value %s",
    (value) => {
      const result = eventSchema.safeParse(
        baseValidData({ start_time: value }),
      );
      expect(result.success).toBe(false);
    },
  );

  it("rejects an empty timezone", () => {
    const result = eventSchema.safeParse(baseValidData({ timezone: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only timezone", () => {
    const result = eventSchema.safeParse(baseValidData({ timezone: "   " }));
    expect(result.success).toBe(false);
  });

  it("accepts a non-default IANA timezone", () => {
    const result = eventSchema.safeParse(
      baseValidData({ timezone: "America/New_York" }),
    );
    expect(result.success).toBe(true);
  });
});

describe("eventSchema past-date validation stays day-granularity only", () => {
  it("rejects a start_date that is a past calendar day", () => {
    const result = eventSchema.safeParse(
      baseValidData({ start_date: "2000-01-01", end_date: "2000-01-01" }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts today's date regardless of start_time already having passed", () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = eventSchema.safeParse(
      baseValidData({
        start_date: today,
        end_date: today,
        start_time: "00:01",
      }),
    );
    expect(result.success).toBe(true);
  });
});

describe("eventEditSchema", () => {
  it("does not apply the past-date check (edit mode)", () => {
    const result = eventEditSchema.safeParse(
      baseValidData({ start_date: "2000-01-01", end_date: "2000-01-01" }),
    );
    expect(result.success).toBe(true);
  });
});
