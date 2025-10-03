import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResetPassword from "./ResetPassword";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";
import { BACKEND_BASE_URL } from "@/lib/constant";

const renderWithProviders = (
  component: React.ReactElement,
  initialEntries = ["/reset-password?token=test-token&email=test@example.com"],
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ResetPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reset password form with password fields when token is present", () => {
    renderWithProviders(<ResetPassword />);

    expect(
      screen.getByText("studio.reset_password.new_password"),
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("common.confirm_your_password"),
    ).toBeDefined();
    expect(screen.getByText("common.button.submit")).toBeDefined();
  });

  it("displays invalid token message when no token is provided", () => {
    renderWithProviders(<ResetPassword />, ["/reset-password"]);

    expect(screen.getByText("Invalid Token")).toBeDefined();
    expect(screen.getByText("No reset password token provided.")).toBeDefined();
  });

  it("shows back to login link", () => {
    renderWithProviders(<ResetPassword />);

    expect(
      screen.getByText("studio.reset_password.back_to_login"),
    ).toBeDefined();
  });

  it("displays password and confirm password labels", () => {
    renderWithProviders(<ResetPassword />);

    expect(screen.getByText("common.password")).toBeDefined();
    expect(screen.getByText("common.confirm_password")).toBeDefined();
  });

  it("validates password requirements", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "123");
    await user.type(confirmPasswordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("validates password confirmation match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password456");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("submits reset password form with valid passwords", async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "Password reset successfully" },
    });

    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(axiosInstance.post)).toHaveBeenCalledWith(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/reset-password`,
        {
          password:
            "d71fce13bfee14deb5302af59d48181a9a09cbc164ebadfde79d36190fcb6f93",
        },
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });
  });

  it("displays success message and navigates to login after successful reset", async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "Password reset successfully" },
    });

    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password reset successfully, redirecting to login page...",
        ),
      ).toBeInTheDocument();
    });

    // Test navigation after timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      },
      { timeout: 3500 },
    );
  });

  it("displays error message when reset password mutation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.post).mockRejectedValue({
      message: "Invalid or expired token",
    });

    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid or expired token")).toBeInTheDocument();
    });
  });

  it("has required attributes on password fields", () => {
    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );

    expect(passwordInput).toHaveAttribute("required");
    expect(confirmPasswordInput).toHaveAttribute("required");
  });

  it("validates empty password field when HTML5 validation is bypassed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );

    passwordInput.removeAttribute("required");
    confirmPasswordInput.removeAttribute("required");

    const submitButton = screen.getByText("common.button.submit");

    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("clears error and success messages on form resubmission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPassword />);

    const passwordInput = screen.getByPlaceholderText(
      "studio.login.placeholder.password",
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "common.confirm_your_password",
    );
    const submitButton = screen.getByText("common.button.submit");

    await user.type(passwordInput, "123");
    await user.type(confirmPasswordInput, "123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });

    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(passwordInput, "validpassword123");
    await user.type(confirmPasswordInput, "validpassword123");

    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "Success" },
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Password must be at least 6 characters"),
      ).not.toBeInTheDocument();
    });
  });
});
