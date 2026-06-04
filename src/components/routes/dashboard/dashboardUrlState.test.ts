import { describe, expect, it } from "vitest";
import {
  buildDashboardSearchParams,
  dashboardUrlStateToFetchParams,
  parseDashboardSearchParams,
} from "./dashboardUrlState";

describe("dashboardUrlState group filter", () => {
  it("parses and builds group_id in URL", () => {
    const params = new URLSearchParams();
    params.set("group_id", "abc-123");
    const state = parseDashboardSearchParams(params);
    expect(state.groupId).toBe("abc-123");

    const built = buildDashboardSearchParams(state);
    expect(built.get("group_id")).toBe("abc-123");
  });

  it("passes group_id to dashboard fetch params", () => {
    const fetchParams = dashboardUrlStateToFetchParams({
      tab: "all",
      page: 1,
      pageSize: 10,
      search: null,
      status: null,
      language: null,
      featured: null,
      sort: null,
      groupId: "group-1",
    });
    expect(fetchParams.group_id).toBe("group-1");
  });
});
