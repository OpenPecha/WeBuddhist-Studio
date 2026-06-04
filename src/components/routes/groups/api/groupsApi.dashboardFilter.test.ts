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

  it("uses for_transfer for reviewers", async () => {
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

    await fetchAccessibleGroupsForDashboard("REVIEWER");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ for_transfer: true }),
      }),
    );
  });

  it("omits for_transfer for creators", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        groups: [],
        skip: 0,
        limit: 100,
        total: 0,
      },
    });

    await fetchAccessibleGroupsForDashboard("CREATOR");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.not.objectContaining({ for_transfer: true }),
      }),
    );
  });
});
