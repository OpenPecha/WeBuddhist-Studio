import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/config/axios-config";
import { fetchGroups, fetchGroupsForTransfer } from "./groupsApi";

vi.mock("@/config/axios-config", () => ({
  default: { get: vi.fn() },
}));

describe("fetchGroupsForTransfer", () => {
  beforeEach(() => {
    vi.mocked(axiosInstance.get).mockReset();
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token");
  });

  it("requests for_transfer=true with skip/limit pagination", async () => {
    vi.mocked(axiosInstance.get)
      .mockResolvedValueOnce({
        data: {
          groups: [
            {
              id: "g1",
              slug: "g1",
              is_public: true,
              metadata: [],
              tags: [],
              follower_count: 0,
            },
          ],
          skip: 0,
          limit: 100,
          total: 2,
        },
      })
      .mockResolvedValueOnce({
        data: {
          groups: [
            {
              id: "g2",
              slug: "g2",
              is_public: true,
              metadata: [],
              tags: [],
              follower_count: 0,
            },
          ],
          skip: 100,
          limit: 100,
          total: 2,
        },
      });

    const groups = await fetchGroupsForTransfer();

    expect(groups).toHaveLength(2);
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(axiosInstance.get).mock.calls[0]?.[1]?.params,
    ).toMatchObject({
      skip: 0,
      limit: 100,
      for_transfer: true,
    });
    expect(
      vi.mocked(axiosInstance.get).mock.calls[1]?.[1]?.params,
    ).toMatchObject({
      skip: 100,
      limit: 100,
      for_transfer: true,
    });
  });

  it("excludes source group and passes search", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        groups: [
          {
            id: "SOURCE",
            slug: "s",
            is_public: true,
            metadata: [],
            tags: [],
            follower_count: 0,
          },
          {
            id: "target",
            slug: "t",
            is_public: true,
            metadata: [],
            tags: [],
            follower_count: 0,
          },
        ],
        skip: 0,
        limit: 100,
        total: 2,
      },
    });

    const groups = await fetchGroupsForTransfer({
      excludeGroupId: "source",
      search: "G3",
    });

    expect(groups.map((g) => g.id)).toEqual(["target"]);
    expect(
      vi.mocked(axiosInstance.get).mock.calls[0]?.[1]?.params,
    ).toMatchObject({
      search: "G3",
      for_transfer: true,
    });
  });

  it("does not send for_transfer on regular fetchGroups", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { groups: [], skip: 0, limit: 10, total: 0 },
    });

    await fetchGroups({ page: 1, limit: 10 });

    expect(
      vi.mocked(axiosInstance.get).mock.calls[0]?.[1]?.params,
    ).not.toHaveProperty("for_transfer");
  });
});
