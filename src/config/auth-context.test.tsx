import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constant";

const mockAuth0Logout = vi.fn();

vi.mock("@/config/auth-context", async () => {
  return await vi.importActual("@/config/auth-context");
});

vi.mock("@/config/studio-auth0", () => ({
  StudioAuth0Provider: ({ children }: { children: React.ReactNode }) =>
    children,
  useStudioAuth0: () => ({
    isConfigured: true,
    isAuthenticated: true,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    logout: vi.fn(),
  }),
  useStudioAuth0Logout: () => mockAuth0Logout,
}));

describe("PlanAuthProvider logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem(ACCESS_TOKEN, "access");
    localStorage.setItem(REFRESH_TOKEN, "refresh");
  });

  it("clears backend tokens and invokes Auth0 logout", async () => {
    const { PlanAuthProvider, useAuth } = await import("@/config/auth-context");

    const LogoutProbe = () => {
      const { logout, isLoggedIn } = useAuth();
      return (
        <button type="button" onClick={logout}>
          {isLoggedIn ? "logged-in" : "logged-out"}
        </button>
      );
    };

    render(
      <MemoryRouter>
        <PlanAuthProvider>
          <LogoutProbe />
        </PlanAuthProvider>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    expect(screen.getByText("logged-in")).toBeInTheDocument();
    await user.click(screen.getByText("logged-in"));

    expect(sessionStorage.getItem(ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN)).toBeNull();
    expect(mockAuth0Logout).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
    );
    expect(screen.getByText("logged-out")).toBeInTheDocument();
  });
});
