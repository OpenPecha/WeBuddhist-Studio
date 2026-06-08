import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();
const mockUseUserInfo = vi.fn();

vi.mock("@/config/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/useUserInfo", () => ({
  useUserInfo: () => mockUseUserInfo(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate" data-to={to} data-replace={replace} />;
    },
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserInfo.mockReturnValue({
      data: {
        is_verified: true,
        is_active: true,
        has_group: true,
        platform_role: "CREATOR",
      },
      isLoading: false,
    });
  });

  it("displays loading state when authentication is loading", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      isAuthLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("common.loading")).toBeDefined();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("redirects to login when user is not authenticated and not loading", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      isAuthLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(mockNavigate).toHaveBeenCalledWith("/login", true);
  });

  it("renders children when user is authenticated and onboarding complete", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: false,
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects inactive users to login", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: false,
      logout: vi.fn(),
    });
    mockUseUserInfo.mockReturnValue({
      data: {
        is_verified: true,
        is_active: false,
        has_group: true,
      },
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
  });

  it("redirects to groups when user has no group", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: false,
      logout: vi.fn(),
    });
    mockUseUserInfo.mockReturnValue({
      data: {
        is_verified: true,
        is_active: true,
        has_group: false,
      },
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/groups",
    );
  });
});
