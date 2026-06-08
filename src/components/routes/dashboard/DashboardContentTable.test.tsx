import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { useTranslate } from "@tolgee/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardContentTable } from "./DashboardContentTable";
import type { DashboardTableRow } from "./dashboardTable";

const t = ((key: string) => key) as ReturnType<typeof useTranslate>["t"];

const sampleRow: DashboardTableRow = {
  id: "plan-1",
  kind: "plan",
  title: "Sample plan",
  image_url: "",
  status: "DRAFT",
  featured: false,
  languages: ["EN"],
  enrolled: 0,
  total_days: 7,
  modifiedAt: "2025-01-01T00:00:00Z",
};

describe("DashboardContentTable", () => {
  it("hides actions column for platform reviewers", () => {
    render(
      <BrowserRouter>
        <DashboardContentTable
          rows={[sampleRow]}
          t={t}
          handleFeatured={vi.fn()}
          platformRole="REVIEWER"
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Sample plan")).toBeInTheDocument();
    expect(
      screen.queryByText("studio.dashboard.actions"),
    ).not.toBeInTheDocument();
  });

  it("shows actions column for creators", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DashboardContentTable
            rows={[sampleRow]}
            t={t}
            handleFeatured={vi.fn()}
            platformRole="CREATOR"
            userInfo={{
              id: "u1",
              platform_role: "CREATOR",
              can_create_content: true,
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("studio.dashboard.actions")).toBeInTheDocument();
  });
});
