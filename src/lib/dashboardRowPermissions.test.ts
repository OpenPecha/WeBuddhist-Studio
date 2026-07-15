import { describe, expect, it } from "vitest";
import { resolveDashboardRowGroupRole } from "./dashboardRowPermissions";
import type { DashboardTableRow } from "@/components/routes/dashboard/dashboardTable";

const baseRow: DashboardTableRow = {
  kind: "plan",
  id: "p1",
  title: "Test",
  image_url: "",
  languages: ["EN"],
  status: "DRAFT",
  total_days: 1,
  enrolled: 0,
  modifiedAt: null,
  featured: false,
};

describe("resolveDashboardRowGroupRole", () => {
  it("uses map role when group_id is present", () => {
    const map = new Map([["g1", "OWNER" as const]]);
    expect(
      resolveDashboardRowGroupRole({ ...baseRow, group_id: "g1" }, map, {
        id: "u1",
        platform_role: "CREATOR",
        can_create_content: true,
      }),
    ).toBe("OWNER");
  });

  it("falls back to AUTHOR for CREATOR on DRAFT when role unknown", () => {
    expect(
      resolveDashboardRowGroupRole({ ...baseRow, group_id: null }, new Map(), {
        id: "u1",
        platform_role: "CREATOR",
        can_create_content: true,
        is_active: true,
        has_group: true,
      }),
    ).toBe("AUTHOR");
  });
});
