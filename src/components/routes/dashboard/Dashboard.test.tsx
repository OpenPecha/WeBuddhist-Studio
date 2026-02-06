import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  it("renders dashboard with search input and add plan button", () => {
    renderWithProviders(<Dashboard />);

    expect(
      screen.getByPlaceholderText("common.placeholder.search"),
    ).toBeDefined();

    expect(screen.getByText("Add Plan")).toBeDefined();
  });

  it("displays table headers correctly", () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("studio.dashboard.cover_image")).toBeDefined();
    expect(screen.getByText("studio.dashboard.title")).toBeDefined();
    expect(screen.getByText("studio.dashboard.plan_days")).toBeDefined();
    expect(screen.getByText("studio.dashboard.plan_used")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
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

  it("renders add plan button with correct link", () => {
    renderWithProviders(<Dashboard />);

    const addPlanButton = screen.getByText("Add Plan");
    expect(addPlanButton).toBeDefined();

    const linkElement = addPlanButton.closest("a");
    expect(linkElement).toBeDefined();
    expect(linkElement?.getAttribute("href")).toBe("/plan/new");
  });

  it("renders loading state by default", () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("Loading...")).toBeDefined();
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

  it("should toggle sort order when clicking column header multiple times", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: { plans: [], total: 0 },
    });

    renderWithProviders(<Dashboard />);
    const titleHeader = screen.getByText("studio.dashboard.title");
    fireEvent.click(titleHeader);
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/cms/plan`),
        expect.objectContaining({
          params: expect.objectContaining({
            sort_by: "title",
            sort_order: "asc",
          }),
        }),
      );
    });
    fireEvent.click(titleHeader);
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/cms/plan`),
        expect.objectContaining({
          params: expect.objectContaining({
            sort_by: "title",
            sort_order: "desc",
          }),
        }),
      );
    });
    fireEvent.click(titleHeader);
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/cms/plan`),
        expect.objectContaining({
          params: expect.objectContaining({
            sort_by: "title",
            sort_order: "asc",
          }),
        }),
      );
    });
  });
});
