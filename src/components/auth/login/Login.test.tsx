import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./Login";
import userEvent from "@testing-library/user-event";
import axiosInstance from "@/config/axios-config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH0_INTENT,
  PENDING_AUTH0_TOKEN_KEY,
  setAuth0Intent,
  setPendingAuth0Token,
} from "@/config/auth0-config";
import { PROFILE_REQUIRED_DETAIL } from "@/lib/phoneAuthApi";

const mockLogin = vi.fn();
const mockLoginWithRedirect = vi.fn();
const mockGetAccessTokenSilently = vi.fn();
const mockNavigate = vi.fn();
const auth0State = {
  isConfigured: true,
  isAuthenticated: false,
  isLoading: false,
};

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
    isConfigured: auth0State.isConfigured,
    isAuthenticated: auth0State.isAuthenticated,
    isLoading: auth0State.isLoading,
    loginWithRedirect: mockLoginWithRedirect,
    getAccessTokenSilently: mockGetAccessTokenSilently,
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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    auth0State.isConfigured = true;
    auth0State.isAuthenticated = false;
    auth0State.isLoading = false;
    mockGetAccessTokenSilently.mockResolvedValue("auth0-access-token");
    mockLoginWithRedirect.mockResolvedValue(undefined);
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { platform_role: "CREATOR" },
    });
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
    expect(screen.getByText("Continue with Google")).toBeDefined();
    expect(screen.getByText("Continue with phone")).toBeDefined();
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
        `/api/v1/cms/auth/login`,
        {
          email: "test@example.com",
          password:
            "6ce4b8809c36425acadafc21bb73a6358201fe0e619d64032f502728493f78dc",
        },
      );
    });
  });

  it("displays error message when login mutation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(axiosInstance.post).mockRejectedValue({
      response: {
        data: {
          detail: "Not Found",
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

  describe("Role gating", () => {
    it("logs in a CREATOR account through the regular login", async () => {
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
        expect(mockLogin).toHaveBeenCalledWith(
          "test-token",
          "test-refresh-token",
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("rejects a staff account signing in through the regular login", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          auth: {
            access_token: "staff-token",
            refresh_token: "staff-refresh-token",
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
        expect(
          screen.getByText(
            "This account is a staff account. Please use the staff login.",
          ),
        ).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows a link to the staff login page", () => {
      renderWithProviders(<Login />);
      expect(screen.getByText("Staff sign in")).toBeInTheDocument();
    });
  });

  describe("Email Re-verification Functionality", () => {
    it("shows email re-verification button when login fails with 'author not verified' error", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            detail: "Author not verified",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });
    });

    it("does not show email re-verification button for other login errors", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            detail: "Invalid credentials",
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
          screen.queryByText("studio.login.reverify_your_email"),
        ).not.toBeInTheDocument();
      });
    });

    it("successfully sends email re-verification request", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              detail: "Author not verified",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("studio.login.reverify_your_email"));

      await waitFor(() => {
        expect(vi.mocked(axiosInstance.post)).toHaveBeenCalledWith(
          `/api/v1/cms/auth/email-re-verification?email=unverified%40example.com`,
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
              detail: "Author not verified",
            },
          },
        })
        .mockRejectedValueOnce({
          response: {
            data: {
              detail: "Email re-verification failed",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("studio.login.reverify_your_email"));

      await waitFor(() => {
        expect(
          screen.getByText("Email re-verification failed"),
        ).toBeInTheDocument();
      });
    });

    it("shows loading state during email re-verification", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              detail: "Author not verified",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("studio.login.reverify_your_email"));

      expect(screen.getByText("studio.login.sending")).toBeInTheDocument();
      expect(screen.getByText("studio.login.sending")).toBeDisabled();
    });

    it("handles case-insensitive error message detection", async () => {
      const user = userEvent.setup();
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: {
          data: {
            detail: "AUTHOR NOT VERIFIED",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });
    });

    it("clears success message when re-verification fails", async () => {
      const user = userEvent.setup();

      vi.mocked(axiosInstance.post)
        .mockRejectedValueOnce({
          response: {
            data: {
              detail: "Author not verified",
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
              detail: "Email re-verification failed",
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
        expect(
          screen.getByText("studio.login.reverify_your_email"),
        ).toBeInTheDocument();
      });
      await user.click(screen.getByText("studio.login.reverify_your_email"));

      await waitFor(() => {
        expect(
          screen.getByText("Verification email sent successfully"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("studio.login.reverify_your_email"));

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

  describe("Phone passwordless login", () => {
    it("starts Universal Login with the SMS connection", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByText("Continue with phone"));

      expect(mockLoginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({
            connection: "sms",
          }),
          appState: expect.objectContaining({
            intent: AUTH0_INTENT.phoneLogin,
            returnTo: "/login",
          }),
        }),
      );
    });

    it("exchanges Auth0 callback token and stores backend tokens", async () => {
      setAuth0Intent(AUTH0_INTENT.phoneLogin);
      auth0State.isAuthenticated = true;
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          author_id: "author-1",
          phone_number: "+15551234567",
          status: "ACTIVE",
          message: "Authentication successful",
          user: { name: "Phone User" },
          auth: {
            access_token: "backend-access",
            refresh_token: "backend-refresh",
            token_type: "bearer",
          },
        },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/cms/auth/phone/exchange",
          { auth0_token: "auth0-access-token" },
        );
        expect(mockLogin).toHaveBeenCalledWith(
          "backend-access",
          "backend-refresh",
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows profile form when exchange requires first and last name", async () => {
      const user = userEvent.setup();
      setAuth0Intent(AUTH0_INTENT.phoneLogin);
      auth0State.isAuthenticated = true;
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { data: { detail: PROFILE_REQUIRED_DETAIL } },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText("Create profile")).toBeInTheDocument();
      });

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          author_id: "author-2",
          phone_number: "+15551234567",
          status: "INACTIVE",
          message: "Author not active",
          user: { name: "Ada Lovelace" },
          auth: null,
        },
      });

      await user.type(screen.getByLabelText("First name"), "Ada");
      await user.type(screen.getByLabelText("Last name"), "Lovelace");
      await user.click(screen.getByText("Create profile"));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/cms/auth/phone/exchange",
          {
            auth0_token: "auth0-access-token",
            first_name: "Ada",
            last_name: "Lovelace",
          },
        );
        expect(screen.getByText("Author not active")).toBeInTheDocument();
        expect(sessionStorage.getItem(PENDING_AUTH0_TOKEN_KEY)).toBeNull();
      });
    });

    it("restores profile form from a pending Auth0 token", async () => {
      setPendingAuth0Token("auth0-access-token");
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText("Create profile")).toBeInTheDocument();
      });
    });

    it("shows API failure message for phone exchange errors", async () => {
      const user = userEvent.setup();
      setPendingAuth0Token("auth0-access-token");
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText("Create profile")).toBeInTheDocument();
      });

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { data: { detail: "Invalid Auth0 SMS token" } },
      });

      await user.type(screen.getByLabelText("First name"), "Ada");
      await user.type(screen.getByLabelText("Last name"), "Lovelace");
      await user.click(screen.getByText("Create profile"));

      await waitFor(() => {
        expect(screen.getByText("Invalid Auth0 SMS token")).toBeInTheDocument();
      });
    });

    it("shows inactive account state for inactive phone exchange responses", async () => {
      setAuth0Intent(AUTH0_INTENT.phoneLogin);
      auth0State.isAuthenticated = true;
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          author_id: "author-3",
          phone_number: "+15551234567",
          status: "INACTIVE",
          message: "Author not active",
          user: { name: "Inactive User" },
          auth: null,
        },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText("Author not active")).toBeInTheDocument();
        expect(
          screen.getByText(
            /activated by a platform administrator before you can sign in/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Google social login", () => {
    it("starts Universal Login with the Google connection", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      await user.click(screen.getByText("Continue with Google"));

      expect(mockLoginWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({
            connection: "google-oauth2",
          }),
          appState: expect.objectContaining({
            intent: AUTH0_INTENT.googleLogin,
            returnTo: "/login",
          }),
        }),
      );
    });

    it("exchanges Auth0 callback token and stores backend tokens", async () => {
      setAuth0Intent(AUTH0_INTENT.googleLogin);
      auth0State.isAuthenticated = true;
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          author_id: "author-g1",
          email: "ada@example.com",
          status: "ACTIVE",
          message: "Authentication successful",
          user: { name: "Ada Lovelace" },
          auth: {
            access_token: "backend-access",
            refresh_token: "backend-refresh",
            token_type: "bearer",
          },
        },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/cms/auth/google/exchange",
          { auth0_token: "auth0-access-token" },
        );
        expect(mockLogin).toHaveBeenCalledWith(
          "backend-access",
          "backend-refresh",
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows profile form when Google exchange requires first and last name", async () => {
      const user = userEvent.setup();
      setAuth0Intent(AUTH0_INTENT.googleLogin);
      auth0State.isAuthenticated = true;
      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { data: { detail: PROFILE_REQUIRED_DETAIL } },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText("Create profile")).toBeInTheDocument();
      });

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {
          author_id: "author-g2",
          email: "ada@example.com",
          status: "INACTIVE",
          message: "Author not active",
          user: { name: "Ada Lovelace" },
          auth: null,
        },
      });

      await user.type(screen.getByLabelText("First name"), "Ada");
      await user.type(screen.getByLabelText("Last name"), "Lovelace");
      await user.click(screen.getByText("Create profile"));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/api/v1/cms/auth/google/exchange",
          {
            auth0_token: "auth0-access-token",
            first_name: "Ada",
            last_name: "Lovelace",
          },
        );
        expect(screen.getByText("Author not active")).toBeInTheDocument();
        expect(sessionStorage.getItem(PENDING_AUTH0_TOKEN_KEY)).toBeNull();
      });
    });
  });
});
