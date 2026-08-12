import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("@/hooks/useUserInfo", () => ({
  useUserInfo: vi.fn(),
}));

import { useUserInfo } from "@/hooks/useUserInfo";

const renderNavbar = () =>
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>,
  );

describe("Navbar", () => {
  it("shows only the Groups link for a CREATOR account", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "CREATOR" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    renderNavbar();

    expect(screen.getByRole("link", { name: /manage author groups/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /go to dashboard/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /view analytics/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /manage tags/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /manage traditions/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /manage accumulator presets/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /manage text audio/i }),
    ).not.toBeInTheDocument();
  });

  it("points the logo link to Groups for a CREATOR account", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "CREATOR" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    renderNavbar();

    expect(screen.getByRole("link", { name: /pecha studio logo/i })).toHaveAttribute(
      "href",
      "/groups",
    );
  });

  it("shows the full nav for a SUPER_ADMIN account", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "SUPER_ADMIN" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    renderNavbar();

    expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /manage tags/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /manage author groups/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /author administration/i })).toBeInTheDocument();
  });

  it("shows the full nav for a REVIEWER account", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: { id: "1", platform_role: "REVIEWER" },
      isLoading: false,
    } as ReturnType<typeof useUserInfo>);

    renderNavbar();

    expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /manage author groups/i })).toBeInTheDocument();
  });

  it("does not restrict the nav while user info is still loading", () => {
    vi.mocked(useUserInfo).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useUserInfo>);

    renderNavbar();

    expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument();
  });
});
