import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./Login";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/config/axios-config";
import { vi } from "vitest";
import { BACKEND_BASE_URL } from "@/lib/constant";

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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    renderWithProviders(<Login />);

    expect(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
    ).toBeDefined();
    expect(screen.getByText("common.button.submit")).toBeDefined();
  });

  it("displays the app title and description", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Webuddhist Studio")).toBeDefined();
    expect(
      screen.getByText("Learn, live and share Buddhist wisdom daily"),
    ).toBeDefined();
  });

  it("shows signup link", () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("studio.login.no_account")).toBeDefined();
  });

  it("submits login form with valid email and password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        auth: {
          access_token: "test-token",
          refresh_token: "test-refresh-token",
        },
      },
    });

    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
      "password123",
    );
    await user.click(screen.getByText("common.button.submit"));
    await waitFor(() => {
      expect(vi.mocked(axiosInstance.post)).toHaveBeenCalledWith(
        `${BACKEND_BASE_URL}/api/v1/cms/auth/login`,
        {
          email: "test@example.com",
          password:
            "0fe95e968475ec73c2826adf398143b39acb43b69384b0349e586a8313bfbaaa",
        },
      );
    });
  });

  it("displays error message when login mutation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.post).mockRejectedValue({
      response: {
        data: {
          message: "Not Found",
        },
      },
    });
    renderWithProviders(<Login />);
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
      "test@example.com",
    );
    await user.type(
      screen.getByPlaceholderText("studio.login.placeholder.password"),
      "password123",
    );
    await user.click(screen.getByText("common.button.submit"));
    await waitFor(() => {
      expect(screen.getByText("Not Found")).toBeInTheDocument();
    });
  });

  describe("Email Re-verification Functionality", () => {
    it("shows email re-verification button when login fails with 'author not verified' error", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "Author not verified",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Author not verified")).toBeInTheDocument();
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });
    });

    it("does not show email re-verification button for other login errors", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "Invalid credentials",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "test@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "wrongpassword",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        expect(
          screen.queryByText("Reverify your Email"),
        ).not.toBeInTheDocument();
      });
    });

    it("successfully sends email re-verification request", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Author not verified",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: "Verification email sent successfully",
          },
        });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Reverify your Email"));

      await waitFor(() => {
        expect(vi.mocked(axiosInstance.post)).toHaveBeenCalledWith(
          `${BACKEND_BASE_URL}/api/v1/cms/auth/email-re-verification?email=unverified%40example.com`,
        );
        expect(
          screen.getByText("Verification email sent successfully"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when email re-verification fails", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Author not verified",
            },
          },
        })
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Email re-verification failed",
            },
          },
        });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Reverify your Email"));

      await waitFor(() => {
        expect(
          screen.getByText("Email re-verification failed"),
        ).toBeInTheDocument();
      });
    });

    it("shows error when trying to re-verify without email", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "Author not verified",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.clear(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
      );
    });

    it("shows loading state during email re-verification", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Author not verified",
            },
          },
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: { message: "Success" } }), 1000),
            ),
        );

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Reverify your Email"));

      expect(screen.getByText("Sending...")).toBeInTheDocument();
      expect(screen.getByText("Sending...")).toBeDisabled();
    });

    it("resets form state when email input changes", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "Author not verified",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Author not verified")).toBeInTheDocument();
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "new",
      );

      expect(screen.queryByText("Author not verified")).not.toBeInTheDocument();
      expect(screen.queryByText("Reverify your Email")).not.toBeInTheDocument();
    });

    it("resets form state when password input changes", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "Author not verified",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Author not verified")).toBeInTheDocument();
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "new",
      );

      expect(screen.queryByText("Author not verified")).not.toBeInTheDocument();
      expect(screen.queryByText("Reverify your Email")).not.toBeInTheDocument();
    });

    it("handles case-insensitive error message detection", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            message: "AUTHOR NOT VERIFIED",
          },
        },
      });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("AUTHOR NOT VERIFIED")).toBeInTheDocument();
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });
    });

    it("clears success message when re-verification fails", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Author not verified",
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            message: "Verification email sent successfully",
          },
        })
        .mockRejectedValueOnce({
          response: {
            data: {
              message: "Email re-verification failed",
            },
          },
        });

      renderWithProviders(<Login />);

      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.email"),
        "unverified@example.com",
      );
      await user.type(
        screen.getByPlaceholderText("studio.login.placeholder.password"),
        "password123",
      );
      await user.click(screen.getByText("common.button.submit"));

      await waitFor(() => {
        expect(screen.getByText("Reverify your Email")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Reverify your Email"));

      await waitFor(() => {
        expect(
          screen.getByText("Verification email sent successfully"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("Reverify your Email"));

      await waitFor(() => {
        expect(
          screen.queryByText("Verification email sent successfully"),
        ).not.toBeInTheDocument();
        expect(
          screen.getByText("Email re-verification failed"),
        ).toBeInTheDocument();
      });
    });
  });
});
