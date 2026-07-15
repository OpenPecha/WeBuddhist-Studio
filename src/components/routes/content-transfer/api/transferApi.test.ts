import { describe, expect, it } from "vitest";
import {
  filterIncomingForGroup,
  idsEqual,
  normalizeTransferListResponse,
  normalizeTransferRequest,
} from "./transferApi";

describe("transferApi normalization", () => {
  it("parses CMS incoming transfers payload", () => {
    const payload = {
      transfers: [
        {
          id: "971fff46-27c2-4edb-8c7b-5e2d2c0820dc",
          entity_type: "plan",
          entity_id: "4ed427a3-a9cc-4db3-a612-77b4b906c106",
          from_group_id: "c9e9f7f6-1dfd-4649-8b9e-8d9d22fe7951",
          to_group_id: "583ccaf1-ffe4-47af-8907-132ea7a5f4b3",
          status: "PENDING",
          entity_title: "sc",
          from_group_title: "G2",
          to_group_title: "G3",
          expires_at: "2026-06-04T11:27:57.654533Z",
          created_at: "2026-06-04T10:47:35.106483Z",
        },
      ],
      total: 1,
    };
    const { requests } = normalizeTransferListResponse(payload);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.content_type).toBe("plan");
    expect(requests[0]?.target_group_id).toBe(
      "583ccaf1-ffe4-47af-8907-132ea7a5f4b3",
    );
    expect(
      filterIncomingForGroup(requests, "583ccaf1-ffe4-47af-8907-132ea7a5f4b3"),
    ).toHaveLength(1);
  });

  it("extracts nested request arrays", () => {
    const payload = {
      data: {
        requests: [
          {
            id: "req-1",
            content_type: "plan",
            content_id: "plan-1",
            status: "PENDING",
            source_group_id: "g-source",
            target_group_id: "g-target",
          },
        ],
      },
    };
    expect(normalizeTransferListResponse(payload).requests).toHaveLength(1);
  });

  it("normalizes alternate id and group field names", () => {
    const row = normalizeTransferRequest({
      request_id: "req-2",
      content_type: "series",
      series_id: "series-1",
      status: "pending",
      source_group: { id: "aaa-bbb" },
      target_group: { id: "ccc-ddd" },
      expires_at: "2099-01-01T00:00:00Z",
    });
    expect(row?.id).toBe("req-2");
    expect(row?.content_type).toBe("series");
    expect(row?.source_group_id).toBe("aaa-bbb");
    expect(row?.target_group_id).toBe("ccc-ddd");
    expect(row?.status).toBe("PENDING");
  });

  it("filters incoming by target group case-insensitively", () => {
    const requests = [
      {
        id: "1",
        status: "PENDING" as const,
        content_type: "plan" as const,
        content_id: "p1",
        source_group_id: "a",
        target_group_id: "ABC-DEF",
        created_at: "",
        expires_at: "2099-01-01T00:00:00Z",
      },
    ];
    expect(
      filterIncomingForGroup(requests, "abc-def").map((r) => r.id),
    ).toEqual(["1"]);
  });

  it("compares ids case-insensitively", () => {
    expect(idsEqual("ABC", "abc")).toBe(true);
  });
});
