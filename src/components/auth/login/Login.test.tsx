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
});
