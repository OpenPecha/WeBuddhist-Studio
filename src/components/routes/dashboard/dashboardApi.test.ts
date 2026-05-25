import { describe, expect, it } from "vitest";
import {
  displayDashboardItemTitle,
  type DashboardApiItem,
} from "./dashboardApi";
import { fetchDashboardItems } from "./dashboardApi";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";

describe("displayDashboardItemTitle", () => {
  it("uses plan title for plan rows", () => {
    const item: DashboardApiItem = {
      id: "p1",
      type: "plan",
      title: "7-Day Mindfulness",
      status: "PUBLISHED",
      featured: false,
      languages: ["EN"],
      enrolled_count: 0,
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(displayDashboardItemTitle(item)).toBe("7-Day Mindfulness");
  });

  it("uses EN metadata title for series (no top-level title)", () => {
    const item: DashboardApiItem = {
      id: "s1",
      type: "series",
      metadata: [
        {
          id: "m1",
          title: "Foundations of Meditation",
          description: "Intro",
          language: "EN",
        },
        {
          id: "m2",
          title: "བོད་སྐད་",
          language: "BO",
        },
      ],
      status: "DRAFT",
      featured: true,
      languages: ["EN", "BO"],
      enrolled_count: 12,
      plans_count: 3,
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(displayDashboardItemTitle(item)).toBe("Foundations of Meditation");
  });

  it("falls back when series has no metadata", () => {
    const item: DashboardApiItem = {
      id: "s1",
      type: "series",
      status: "DRAFT",
      featured: false,
      languages: ["EN"],
      enrolled_count: 0,
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(displayDashboardItemTitle(item)).toBe("Untitled series");
  });
});

describe("fetchDashboardItems", () => {
  it("maps series title from metadata in table rows", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        items: [
          {
            id: "series-1",
            type: "series",
            metadata: [
              {
                id: "meta-1",
                title: "Test Series",
                language: "EN",
              },
            ],
            status: "PUBLISHED",
            featured: false,
            languages: ["EN"],
            enrolled_count: 0,
            plans_count: 2,
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
        pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
      },
    });

    const result = await fetchDashboardItems({
      tab: "series",
      page: 1,
    });

    expect(result.rows[0]?.title).toBe("Test Series");
    vi.restoreAllMocks();
  });
});
