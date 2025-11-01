import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmailVerification from "./EmailVerification";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";

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

    expect(screen.getByText("studio.auth.email.verifying_email")).toBeDefined();
    expect(
      screen.getByText(
        "studio.auth.email.please_wait_while_we_verify_your_email_address",
      ),
    ).toBeDefined();
  });

  it("renders success state when API call succeeds", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message:
          "studio.auth.email.email_verified_successfully_your_account_is_pending_admin_approval",
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(
        screen.getByText("studio.auth.email.email_verified"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "studio.auth.email.email_verified_successfully_your_account_is_pending_admin_approval",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("studio.auth.email.continue_to_login"),
    ).toBeInTheDocument();
  });

  it("renders error state when API call fails", async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue({
      response: {
        data: {
          detail: "studio.auth.email.invalid_verification_token",
        },
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(
        screen.getByText("studio.auth.email.verification_failed"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("studio.auth.email.invalid_verification_token"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("studio.auth.email.continue_to_login"),
    ).not.toBeInTheDocument();
  });

  it("makes correct API call with token", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message:
          "studio.auth.email.email_verified_successfully_your_account_is_pending_admin_approval",
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith(
        `/api/v1/cms/auth/verify-email`,
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });
  });

  it("navigates to login when continue button is clicked", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message:
          "studio.auth.email.email_verified_successfully_your_account_is_pending_admin_approval",
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(
        screen.getByText("studio.auth.email.continue_to_login"),
      ).toBeInTheDocument();
    });

    const loginButton = screen.getByText("studio.auth.email.continue_to_login");
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("displays success icon when verification succeeds", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        email: "test@example.com",
        status: "INACTIVE",
        message:
          "Email verified successfully. Your account is pending admin approval",
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
          detail: "Invalid verification token",
        },
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      const errorIcon = document.querySelector(".text-red-600");
      expect(errorIcon).toBeDefined();
    });
  });

  it("displays fallback error message when backend error structure is unexpected", async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue({
      response: {
        data: {
          error: "studio.auth.email.some_other_error_format",
        },
      },
    });

    renderWithProviders(<EmailVerification />);

    await waitFor(() => {
      expect(
        screen.getByText("studio.auth.email.verification_failed"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("studio.auth.email.there_was_an_error"),
    ).toBeInTheDocument();
  });
});
