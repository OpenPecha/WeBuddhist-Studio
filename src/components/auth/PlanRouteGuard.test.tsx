import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PlanRouteGuard from "./PlanRouteGuard";
import { ROUTES } from "@/routes/paths";

vi.mock("@/hooks/useUserInfo", () => ({
  useUserInfo: vi.fn(),
}));

import { useUserInfo } from "@/hooks/useUserInfo";

describe("PlanRouteGuard", () => {
  it("redirects reviewers to dashboard", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "REVIEWER" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    render(
      <MemoryRouter initialEntries={["/plan/plan-1"]}>
        <Routes>
          <Route
            path="/plan/:planId"
            element={
              <PlanRouteGuard>
                <div>Plan page</div>
              </PlanRouteGuard>
            }
          />
          <Route path={ROUTES.dashboard} element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Plan page")).not.toBeInTheDocument();
  });

  it("renders children for creators", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "CREATOR" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    render(
      <MemoryRouter initialEntries={["/plan/plan-1"]}>
        <Routes>
          <Route
            path="/plan/:planId"
            element={
              <PlanRouteGuard>
                <div>Plan page</div>
              </PlanRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Plan page")).toBeInTheDocument();
  });
});
