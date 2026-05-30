import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import SeriesDetailsPage from "./SeriesDetailsPage";
import * as seriesApi from "@/components/routes/create-series/api/seriesApi";

vi.mock(
  "@/components/routes/create-series/components/PlanSearchSelector",
  () => ({
    default: () => <div data-testid="plan-search-selector" />,
  }),
);

const seriesFixture = {
  id: "series-1",
  metadata: [{ id: "m1", title: "Abhidhamma in a year", language: "EN" }],
  featured: false,
  status: "DRAFT",
  plans: [
    {
      id: "plan-zh-1",
      title: "示例计划",
      language: "ZH",
      status: "DRAFT",
      total_days: 7,
      featured: false,
    },
    {
      id: "plan-en-1",
      title: "English Plan",
      language: "EN",
      status: "PUBLISHED",
      total_days: 5,
      featured: true,
    },
  ],
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/series/series-1"]}>
        <Routes>
          <Route path="/series/:seriesId" element={<SeriesDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SeriesDetailsPage", () => {
  beforeEach(() => {
    vi.spyOn(seriesApi, "getSeries").mockResolvedValue(seriesFixture as never);
    vi.spyOn(seriesApi, "putSeriesPlans").mockResolvedValue(
      seriesFixture as never,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates to plan new with series and active language in location state", async () => {
    function PlanNewStateProbe() {
      const { state } = useLocation();
      return (
        <div data-testid="plan-new-location-state">{JSON.stringify(state)}</div>
      );
    }

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/series/series-1"]}>
          <Routes>
            <Route path="/series/:seriesId" element={<SeriesDetailsPage />} />
            <Route path="/plan/new" element={<PlanNewStateProbe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Abhidhamma in a year")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /中文/i }));
    await user.click(screen.getByRole("link", { name: /Add New Plan/i }));

    await waitFor(() => {
      expect(screen.getByTestId("plan-new-location-state")).toHaveTextContent(
        JSON.stringify({ seriesId: "series-1", language: "ZH" }),
      );
    });
  });

  it("renders series title and plans for selected language tab", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Abhidhamma in a year")).toBeInTheDocument();
    });

    expect(screen.getByText("English Plan")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /中文/i }));

    await waitFor(() => {
      expect(screen.getByText("示例计划")).toBeInTheDocument();
    });
    expect(screen.queryByText("English Plan")).not.toBeInTheDocument();
  });
});
