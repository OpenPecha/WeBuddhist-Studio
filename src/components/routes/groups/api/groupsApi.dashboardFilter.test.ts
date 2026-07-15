import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/config/axios-config";
import { fetchAccessibleGroupsForDashboard } from "./groupsApi";

vi.mock("@/config/axios-config", () => ({
  default: { get: vi.fn() },
}));

describe("fetchAccessibleGroupsForDashboard", () => {
  beforeEach(() => {
    vi.mocked(axiosInstance.get).mockReset();
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token");
  });

  it("uses for_dashboard for reviewers (not for_transfer)", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        groups: [
          {
            id: "g1",
            slug: "g1",
            is_public: true,
            metadata: [{ title: "A", language: "EN" }],
            tags: [],
            follower_count: 0,
          },
        ],
        skip: 0,
        limit: 100,
        total: 1,
      },
    });

    await fetchAccessibleGroupsForDashboard({
      platform_role: "REVIEWER",
      has_group: true,
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ for_dashboard: true }),
      }),
    );
    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.not.objectContaining({ for_transfer: true }),
      }),
    );
  });

  it("uses for_dashboard for super admins", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        groups: [
          {
            id: "g1",
            slug: "g1",
            is_public: true,
            metadata: [{ title: "A", language: "EN" }],
            tags: [],
            follower_count: 0,
          },
        ],
        skip: 0,
        limit: 100,
        total: 1,
      },
    });

    await fetchAccessibleGroupsForDashboard({
      platform_role: "SUPER_ADMIN",
      has_group: true,
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ for_dashboard: true }),
      }),
    );
  });

  it("omits for_dashboard and for_transfer for creators", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        groups: [],
        skip: 0,
        limit: 100,
        total: 0,
      },
    });

    await fetchAccessibleGroupsForDashboard({
      platform_role: "CREATOR",
      has_group: true,
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.not.objectContaining({
          for_transfer: true,
          for_dashboard: true,
        }),
      }),
    );
  });

  it("skips API for creators without a group", async () => {
    const groups = await fetchAccessibleGroupsForDashboard({
      platform_role: "CREATOR",
      has_group: false,
    });

    expect(groups).toEqual([]);
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("falls back to plain list when for_dashboard returns no groups", async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: { groups: [], skip: 0, limit: 100, total: 0 },
      })
      .mockResolvedValueOnce({
        data: {
          groups: [
            {
              id: "g2",
              slug: "g2",
              is_public: true,
              metadata: [{ title: "B", language: "EN" }],
              tags: [],
              follower_count: 0,
            },
          ],
          skip: 0,
          limit: 100,
          total: 1,
        },
      });

    const groups = await fetchAccessibleGroupsForDashboard({
      platform_role: "REVIEWER",
      has_group: true,
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("g2");
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    expect(axiosInstance.get).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ for_dashboard: true }),
      }),
    );
    expect(axiosInstance.get).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        params: expect.not.objectContaining({
          for_dashboard: true,
          for_transfer: true,
        }),
      }),
    );
  });
});
