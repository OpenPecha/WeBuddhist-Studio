import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmailVerification from "./EmailVerification";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";
import { BACKEND_BASE_URL } from "@/lib/constant";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams("?token=test-token")],
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

describe("EmailVerification Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<EmailVerification />);

    expect(screen.getByText("Verifying Email...")).toBeDefined();
    expect(screen.getByText("Please wait while we verify your email address.")).toBeDefined();
  });

  it("renders success state when API call succeeds", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message: "Email verified successfully. Your account is pending admin approval"
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText("Email Verified!")).toBeInTheDocument();
    });

    expect(screen.getByText("Email verified successfully. Your account is pending admin approval")).toBeInTheDocument();
    expect(screen.getByText("Continue to Login")).toBeInTheDocument();
  });

  it("renders error state when API call fails", async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue({
      response: {
        data: {
          message: "Invalid token",
        },
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    });

    expect(screen.getByText("There was an error verifying your email. Please try again or contact support.")).toBeInTheDocument();
    expect(screen.queryByText("Continue to Login")).not.toBeInTheDocument();
  });

  it("makes correct API call with token", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message: "Email verified successfully. Your account is pending admin approval"
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/verify-email`,
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        }
      );
    });
  });

  it("navigates to login when continue button is clicked", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message: "Email verified successfully. Your account is pending admin approval"
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(screen.getByText("Continue to Login")).toBeInTheDocument();
    });

    const loginButton = screen.getByText("Continue to Login");
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("displays success icon when verification succeeds", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message: "Email verified successfully. Your account is pending admin approval"
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      const successIcon = document.querySelector(".text-green-600");
      expect(successIcon).toBeDefined();
    });
  });

  it("displays error icon when verification fails", async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue({
      response: {
        data: {
          message: "Invalid token",
        },
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      const errorIcon = document.querySelector(".text-red-600");
      expect(errorIcon).toBeDefined();
    });
  });

});
