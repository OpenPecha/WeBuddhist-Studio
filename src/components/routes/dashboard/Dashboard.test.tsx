import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";

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
    renderWithProviders(<Dashboard />);

    expect(
      screen.getByPlaceholderText("common.placeholder.search"),
    ).toBeDefined();

    expect(screen.getByLabelText("Add")).toBeDefined();
  });

  it("displays table headers correctly", () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("studio.dashboard.cover_image")).toBeDefined();
    expect(screen.getByText("studio.dashboard.title")).toBeDefined();
    expect(screen.getByText("Enrolled")).toBeDefined();
    expect(screen.getByText("Modified")).toBeDefined();
    expect(screen.getByText("Featured")).toBeDefined();
    expect(screen.getByText("studio.dashboard.actions")).toBeDefined();
  });

  it("renders search input with correct placeholder", () => {
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    );
    expect(searchInput).toBeDefined();
    expect(searchInput.tagName).toBe("INPUT");
  });

  it("allows typing in search input", () => {
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(searchInput.value).toBe("test search");
  });

  it("renders add dropdown with plan and series links", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: { plans: [], total: 0 },
    });
    const user = userEvent.setup();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Add"));

    expect(await screen.findByRole("menuitem", { name: "Add Plan" })).toBeInTheDocument();
    const addPlanItem = screen.getByRole("menuitem", { name: "Add Plan" });
    expect(addPlanItem.closest("a")?.getAttribute("href")).toBe("/plan/new");

    const addSeriesItem = screen.getByRole("menuitem", { name: "Add Series" });
    expect(addSeriesItem.closest("a")?.getAttribute("href")).toBe("/series/new");
  });

  it("renders loading state by default", async () => {
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("Loading...")).toBeDefined();
  });

  it("has proper table structure", () => {
    renderWithProviders(<Dashboard />);

    const table = screen.getByRole("table");
    expect(table).toBeDefined();

    const coverImageHeader = screen.getByText("studio.dashboard.cover_image");
    expect(coverImageHeader.tagName).toBe("TH");
  });

  it("fetches plans correctly and returns the correct data", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: { plans: [], total: 0 },
    });

    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("requests plans sorted by recently modified (updated_at desc)", async () => {
    const getSpy = vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: { plans: [], total: 0 },
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/cms/plans`),
        expect.objectContaining({
          params: expect.objectContaining({
            sort_by: "updated_at",
            sort_order: "desc",
          }),
        }),
      );
    });
  });

  it("handles toggle featured on a plan", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        plans: [
          {
            id: "plan-1",
            image_url: "",
            title: "Test Plan",
            description: "Test description",
            total_days: "7",
            subscription_count: "10",
            status: "PUBLISHED",
            featured: false,
            language: "EN",
          },
        ],
        total: 1,
      },
    });
    axiosInstance.patch = vi.fn().mockResolvedValue({ data: {} });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

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
