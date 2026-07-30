import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGroups } from "./groupsApi";
import { makeGroupPartnerSearchFn } from "./groupPickerApi";

vi.mock("./groupsApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./groupsApi")>();
  return { ...actual, fetchGroups: vi.fn() };
});

const group = (id: string, title: string) => ({
  id,
  slug: id,
  is_public: true,
  metadata: [{ title, language: "EN" as const }],
  tags: [],
  follower_count: 0,
});

beforeEach(() => {
  vi.mocked(fetchGroups).mockReset();
});

describe("makeGroupPartnerSearchFn", () => {
  it("maps groups to FkOptions and excludes given ids", async () => {
    vi.mocked(fetchGroups).mockResolvedValueOnce({
      groups: [group("g1", "One"), group("g2", "Two"), group("owner", "Owner")],
      skip: 0,
      limit: 20,
      total: 3,
    });

    const searchFn = makeGroupPartnerSearchFn(["g2", "owner"]);
    const result = await searchFn({ search: "x", skip: 0, limit: 20 });

    expect(result.items.map((i) => i.id)).toEqual(["g1"]);
    expect(result.items[0].title).toBe("One");
    expect(result.total).toBe(3);
  });

  it("derives the page number from skip/limit", async () => {
    vi.mocked(fetchGroups).mockResolvedValueOnce({
      groups: [],
      skip: 40,
      limit: 20,
      total: 0,
    });

    const searchFn = makeGroupPartnerSearchFn([]);
    await searchFn({ skip: 40, limit: 20 });

    expect(fetchGroups).toHaveBeenCalledWith({
      page: 3,
      limit: 20,
      search: undefined,
    });
  });
});
