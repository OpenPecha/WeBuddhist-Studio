import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";

const emptyDashboardResponse = {
  items: [],
  pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 },
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>,
  );
};

describe("Dashboard Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders dashboard with search input and add button", () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    renderWithProviders(<Dashboard />);

    expect(
      screen.getByPlaceholderText("common.placeholder.search"),
    ).toBeDefined();

    expect(screen.getByLabelText("Add")).toBeDefined();
  });

  it("displays table headers correctly", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("studio.dashboard.cover_image")).toBeDefined();
    expect(screen.getByText("studio.dashboard.title")).toBeDefined();
    expect(screen.getByText("Enrolled")).toBeDefined();
    expect(screen.getByText("Date Modified")).toBeDefined();
    expect(screen.getByText("Featured")).toBeDefined();
    expect(screen.getByText("studio.dashboard.actions")).toBeDefined();
  });

  it("renders search input with correct placeholder", () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    );
    expect(searchInput).toBeDefined();
    expect(searchInput.tagName).toBe("INPUT");
  });

  it("allows typing in search input", () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(searchInput.value).toBe("test search");
  });

  it("renders add dropdown with plan and series links", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Add"));

    expect(
      await screen.findByRole("menuitem", { name: "Add Plan" }),
    ).toBeInTheDocument();
    const addPlanItem = screen.getByRole("menuitem", { name: "Add Plan" });
    expect(addPlanItem.closest("a")?.getAttribute("href")).toBe("/plan/new");

    const addSeriesItem = screen.getByRole("menuitem", { name: "Add Series" });
    expect(addSeriesItem.closest("a")?.getAttribute("href")).toBe(
      "/series/new",
    );
  });

  it("has proper table structure when items exist", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        items: [
          {
            id: "plan-1",
            type: "plan",
            title: "Sample",
            image_url: "",
            status: "DRAFT",
            featured: false,
            languages: ["EN"],
            enrolled_count: 0,
            updated_at: "2025-01-01T00:00:00Z",
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
        pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
      },
    });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeDefined();
    });

    const coverImageHeader = screen.getByText("studio.dashboard.cover_image");
    expect(coverImageHeader.tagName).toBe("TH");
  });

  it("fetches dashboard items from unified CMS endpoint", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });

    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/cms/dashboard/items"),
        expect.objectContaining({
          params: expect.objectContaining({
            tab: "all",
            page: 1,
            page_size: 10,
          }),
        }),
      );
    });
  });

  it("passes tab and filters when switching to plans", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: emptyDashboardResponse,
    });
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Plans" }));

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/cms/dashboard/items"),
        expect.objectContaining({
          params: expect.objectContaining({
            tab: "plans",
          }),
        }),
      );
    });
  });

  it("shows stack badge on series cover image", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        items: [
          {
            id: "series-1",
            type: "series",
            title: "Test Series",
            image_url: "https://example.com/cover.jpg",
            status: "PUBLISHED",
            featured: false,
            languages: ["EN"],
            enrolled_count: 5,
            plans_count: 10,
            updated_at: "2025-01-01T00:00:00Z",
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
        pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
      },
    });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test Series")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Series, 10 plans")).toBeInTheDocument();
  });

  it("handles toggle featured on a plan", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        items: [
          {
            id: "plan-1",
            type: "plan",
            title: "Test Plan",
            image_url: "",
            status: "PUBLISHED",
            featured: false,
            languages: ["EN"],
            enrolled_count: 10,
            updated_at: "2025-01-01T00:00:00Z",
            created_at: "2025-01-01T00:00:00Z",
          },
        ],
        pagination: { page: 1, page_size: 10, total: 1, total_pages: 1 },
      },
    });
    axiosInstance.patch = vi.fn().mockResolvedValue({ data: {} });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test Plan")).toBeInTheDocument();
    });

    const featuredButton = screen.getByRole("button", { name: "Not featured" });
    fireEvent.click(featuredButton);

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/api/v1/cms/plans/plan-1/featured",
        expect.any(Object),
      );
    });
  });
});
