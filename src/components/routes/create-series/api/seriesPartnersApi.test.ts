import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/config/axios-config";
import {
  addSeriesPartner,
  listSeriesPartners,
  removeSeriesPartner,
} from "./seriesPartnersApi";

vi.mock("@/config/axios-config", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const SERIES_ID = "series-1";

beforeEach(() => {
  vi.mocked(axiosInstance.get).mockReset();
  vi.mocked(axiosInstance.post).mockReset();
  vi.mocked(axiosInstance.delete).mockReset();
});

describe("listSeriesPartners", () => {
  it("returns the partners array and passes language when given", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        partners: [
          {
            id: "row-1",
            group_id: "grp-owner",
            group_name: "Owner Group",
            group_image: null,
            is_owner: true,
          },
        ],
      },
    });

    const partners = await listSeriesPartners(SERIES_ID, "BO");

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/cms/series/${SERIES_ID}/partners`,
      { params: { language: "BO" } },
    );
    expect(partners).toHaveLength(1);
    expect(partners[0].is_owner).toBe(true);
  });

  it("omits params when no language and tolerates a missing array", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: {} });

    const partners = await listSeriesPartners(SERIES_ID);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/cms/series/${SERIES_ID}/partners`,
      { params: undefined },
    );
    expect(partners).toEqual([]);
  });
});

describe("addSeriesPartner", () => {
  it("POSTs { group_id } and returns the created row", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: {
        id: "row-2",
        group_id: "grp-2",
        group_name: "Partner Group",
        group_image: "https://s3/x.jpg",
        is_owner: false,
      },
    });

    const row = await addSeriesPartner(SERIES_ID, "grp-2", "EN");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      `/api/v1/cms/series/${SERIES_ID}/partners`,
      { group_id: "grp-2" },
      { params: { language: "EN" } },
    );
    expect(row.group_id).toBe("grp-2");
  });
});

describe("removeSeriesPartner", () => {
  it("DELETEs by group_id (not the row id)", async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({ data: null });

    await removeSeriesPartner(SERIES_ID, "grp-2");

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      `/api/v1/cms/series/${SERIES_ID}/partners/grp-2`,
    );
  });
});
