import { describe, expect, it } from "vitest";
import {
  dateOnlyToDate,
  dateToDateOnly,
  fromBackendISO,
  getTimeZoneOffsetMs,
  toBackendISO,
} from "./utils";

describe("dateOnlyToDate / dateToDateOnly", () => {
  it("round-trips a plain calendar date", () => {
    const d = dateOnlyToDate("2026-03-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(15);
    expect(dateToDateOnly(d)).toBe("2026-03-15");
  });
});

describe("getTimeZoneOffsetMs", () => {
  it("resolves a fixed +5:30 offset for Asia/Kolkata year-round", () => {
    const summer = new Date(Date.UTC(2026, 5, 15, 12, 0, 0));
    const winter = new Date(Date.UTC(2026, 11, 15, 12, 0, 0));
    const fiveThirtyHoursMs = 5.5 * 60 * 60 * 1000;
    expect(getTimeZoneOffsetMs(summer, "Asia/Kolkata")).toBe(fiveThirtyHoursMs);
    expect(getTimeZoneOffsetMs(winter, "Asia/Kolkata")).toBe(fiveThirtyHoursMs);
  });

  it("resolves DST-dependent offsets for America/New_York", () => {
    const summer = new Date(Date.UTC(2026, 6, 15, 12, 0, 0)); // EDT, UTC-4
    const winter = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // EST, UTC-5
    expect(getTimeZoneOffsetMs(summer, "America/New_York")).toBe(
      -4 * 60 * 60 * 1000,
    );
    expect(getTimeZoneOffsetMs(winter, "America/New_York")).toBe(
      -5 * 60 * 60 * 1000,
    );
  });
});

describe("toBackendISO / fromBackendISO round trip", () => {
  it("round-trips a fixed-offset zone (Asia/Kolkata, +5:30)", () => {
    const date = dateOnlyToDate("2026-06-15");
    const iso = toBackendISO(date, "09:30", "Asia/Kolkata");
    // 09:30 IST == 04:00 UTC
    expect(iso).toBe("2026-06-15T04:00:00.000Z");

    const { date: back, hhmm } = fromBackendISO(iso, "Asia/Kolkata");
    expect(dateToDateOnly(back)).toBe("2026-06-15");
    expect(hhmm).toBe("09:30");
  });

  it("round-trips a DST-observing zone in summer (America/New_York, EDT)", () => {
    const date = dateOnlyToDate("2026-07-04");
    const iso = toBackendISO(date, "14:00", "America/New_York");
    // 14:00 EDT (UTC-4) == 18:00 UTC
    expect(iso).toBe("2026-07-04T18:00:00.000Z");

    const { date: back, hhmm } = fromBackendISO(iso, "America/New_York");
    expect(dateToDateOnly(back)).toBe("2026-07-04");
    expect(hhmm).toBe("14:00");
  });

  it("round-trips a DST-observing zone in winter (America/New_York, EST)", () => {
    const date = dateOnlyToDate("2026-01-15");
    const iso = toBackendISO(date, "09:00", "America/New_York");
    // 09:00 EST (UTC-5) == 14:00 UTC
    expect(iso).toBe("2026-01-15T14:00:00.000Z");

    const { date: back, hhmm } = fromBackendISO(iso, "America/New_York");
    expect(dateToDateOnly(back)).toBe("2026-01-15");
    expect(hhmm).toBe("09:00");
  });

  it("handles the spring-forward DST transition correctly", () => {
    // 2026-03-08 02:30 local time does not exist in America/New_York
    // (clocks jump from 02:00 to 03:00); composing it should still resolve
    // to a sane, self-consistent UTC instant.
    const date = dateOnlyToDate("2026-03-08");
    const iso = toBackendISO(date, "01:30", "America/New_York");
    // Just before the jump: EST (UTC-5) still in effect => 06:30 UTC
    expect(iso).toBe("2026-03-08T06:30:00.000Z");
  });

  it("handles a date crossing midnight UTC without shifting the calendar day", () => {
    // Late-evening local time in a zone ahead of UTC crosses into the next
    // UTC day; fromBackendISO must still report the zone's own local date.
    const date = dateOnlyToDate("2026-06-15");
    const iso = toBackendISO(date, "23:00", "Asia/Kolkata");
    const { date: back, hhmm } = fromBackendISO(iso, "Asia/Kolkata");
    expect(dateToDateOnly(back)).toBe("2026-06-15");
    expect(hhmm).toBe("23:00");
  });
});

describe("legacy events without a stored timezone", () => {
  it("falls back to Asia/Kolkata when mapping to form data (mirrors mapEventToFormData)", () => {
    const DEFAULT_TIMEZONE = "Asia/Kolkata";
    const legacyEvent = {
      start_date: "2026-05-01T00:00:00Z",
      timezone: undefined as string | undefined,
    };
    const timezone = legacyEvent.timezone?.trim() || DEFAULT_TIMEZONE;
    expect(timezone).toBe("Asia/Kolkata");

    const { date, hhmm } = fromBackendISO(legacyEvent.start_date, timezone);
    // Old UTC-midnight events land at 05:30 IST wall time.
    expect(hhmm).toBe("05:30");
    expect(dateToDateOnly(date)).toBe("2026-05-01");
  });
});
