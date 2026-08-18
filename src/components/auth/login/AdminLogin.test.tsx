import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminLogin from "./AdminLogin";
import axiosInstance from "@/config/axios-config";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/config/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    isLoggedIn: false,
    isAuthLoading: false,
  }),
}));

vi.mock("@/config/studio-auth0", () => ({
  useStudioAuth0: () => ({
    isConfigured: true,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe("AdminLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("logs in a SUPER_ADMIN account", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLogin />);
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        auth: {
          access_token: "admin-token",
          refresh_token: "admin-refresh-token",
        },
      },
    });
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { platform_role: "SUPER_ADMIN" },
    });

    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
      "admin@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
      "password123",
    );
    await user.click(screen.getByText("common.button.submit"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "admin-token",
        "admin-refresh-token",
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("logs in a REVIEWER account", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLogin />);
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        auth: {
          access_token: "reviewer-token",
          refresh_token: "reviewer-refresh-token",
        },
      },
    });
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { platform_role: "REVIEWER" },
    });

    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
      "reviewer@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
      "password123",
    );
    await user.click(screen.getByText("common.button.submit"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "reviewer-token",
        "reviewer-refresh-token",
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("rejects a CREATOR account signing in through the staff login", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLogin />);
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        auth: {
          access_token: "creator-token",
          refresh_token: "creator-refresh-token",
        },
      },
    });
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { platform_role: "CREATOR" },
    });

    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
      "creator@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
      "password123",
    );
    await user.click(screen.getByText("common.button.submit"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "This sign-in is for staff accounts only. Please use the regular login.",
        ),
      ).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not show the signup link, and offers a tab back to the regular login", () => {
    renderWithProviders(<AdminLogin />);
    expect(screen.queryByText("studio.login.no_account")).toBeNull();
    const staffTab = screen.getByRole("tab", { name: "Staff sign in" });
    expect(staffTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
