import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/routes/task/api/taskApi", () => ({
  uploadImageToS3: vi.fn(),
}));

import {
  buildCreateEventBody,
  buildUpdateEventBody,
  mapEventToFormData,
  type EventDTO,
} from "./eventsApi";
import { defaultEventFormValues } from "@/schema/EventSchema";

const baseForm = () => ({
  ...defaultEventFormValues(),
  start_date: "2026-01-01",
  end_date: "2026-01-01",
  metadata: [{ language: "EN" as const, name: "Teaching", description: "" }],
});

describe("buildCreateEventBody — event_format", () => {
  it("includes event_format when one is picked", () => {
    const body = buildCreateEventBody(
      { ...baseForm(), event_format: "hybrid" },
      "group-1",
    );
    expect(body.event_format).toBe("hybrid");
  });

  it("omits event_format entirely when not specified", () => {
    const body = buildCreateEventBody(baseForm(), "group-1");
    expect("event_format" in body).toBe(false);
  });
});

describe("buildUpdateEventBody — event_format", () => {
  it("omits event_format when unchanged", () => {
    const original = { ...baseForm(), event_format: "online" as const };
    const body = buildUpdateEventBody({ ...original }, original);
    expect("event_format" in body).toBe(false);
  });

  it("sends the new value when changed", () => {
    const original = { ...baseForm(), event_format: "online" as const };
    const body = buildUpdateEventBody(
      { ...original, event_format: "offline" },
      original,
    );
    expect(body.event_format).toBe("offline");
  });

  it("sends null when cleared back to not specified", () => {
    const original = { ...baseForm(), event_format: "hybrid" as const };
    const body = buildUpdateEventBody(
      { ...original, event_format: null },
      original,
    );
    expect(body.event_format).toBeNull();
  });
});

describe("mapEventToFormData — event_format", () => {
  const event = {
    id: "e1",
    group_id: "group-1",
    start_date: "2026-01-01",
    end_date: "2026-01-01",
    is_one_day: true,
    featured: false,
    metadata: [{ id: "m1", name: "Teaching", language: "EN" }],
    created_at: "2026-01-01",
    created_by: "u1",
  } satisfies EventDTO;

  it("reads event_format when the event has one", () => {
    const form = mapEventToFormData({ ...event, event_format: "online" });
    expect(form.event_format).toBe("online");
  });

  it("falls back to null when the field is absent", () => {
    expect(mapEventToFormData(event).event_format).toBeNull();
  });
});
