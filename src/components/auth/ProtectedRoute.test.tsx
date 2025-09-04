import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("@/config/auth-context", () => ({
  useAuth: () => mockUseAuth(),
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

    expect(screen.getByText("Loading...")).toBeDefined();
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

    expect(screen.getByTestId("navigate")).toBeDefined();
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-replace",
      "true",
    );
    expect(screen.queryByText("Protected Content")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login", true);
  });

  it("renders children when user is authenticated and not loading", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeDefined();
    expect(screen.queryByText("Loading...")).toBeNull();
    expect(screen.queryByTestId("navigate")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders complex children components when authenticated", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: false,
    });

    const ComplexChild = () => (
      <div>
        <h1>Dashboard</h1>
        <button>Action Button</button>
        <p>Some content here</p>
      </div>
    );

    renderWithRouter(
      <ProtectedRoute>
        <ComplexChild />
      </ProtectedRoute>,
    );

    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Action Button")).toBeDefined();
    expect(screen.getByText("Some content here")).toBeDefined();
  });

  it("does not render children during loading state even if user appears logged in", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: true,
      isAuthLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Loading...")).toBeDefined();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("uses the correct CSS classes for loading state", () => {
    mockUseAuth.mockReturnValue({
      isLoggedIn: false,
      isAuthLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    const loadingContainer = screen.getByText("Loading...").parentElement;
    expect(loadingContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "h-full",
    );
    expect(screen.getByText("Loading...")).toHaveClass("text-lg");
  });
});
