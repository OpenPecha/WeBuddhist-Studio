import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Profile from "./Profile";

const mockUserInfo = {
  id: "author-123",
  firstname: "Tenzin",
  lastname: "la",
  email: "test@example.com",
  bio: "Test bio",
  image_url: "https://example.com/image.jpg",
  social_profiles: [
    {
      account: "youtube",
      url: "https://youtube.com/tenzinla",
    },
  ],
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ author_id: "author-123" }),
  };
});

vi.mock("@/components/ui/molecules/user-card/UserCard", () => ({
  default: ({ userInfo }: any) => (
    <div data-testid="user-card">
      <div>
        {userInfo?.firstname} {userInfo?.lastname}
      </div>
      <div>{userInfo?.email}</div>
    </div>
  ),
}));

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn((key) => {
      if (key === "accessToken") return "test-token";
      return null;
    }),
  },
  writable: true,
});

const renderWithProviders = (
  component: React.ReactElement,
  queryData?: any,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  if (queryData) {
    queryClient.setQueryData(["userInfo", "author-123"], queryData);
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile with user info when data is loaded", async () => {
    renderWithProviders(<Profile />, mockUserInfo);
    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });
    expect(screen.getByTestId("user-card")).toBeInTheDocument();
    expect(screen.getByText("Tenzin la")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("fetches user info with correct parameters", async () => {
    const { default: axiosInstance } = await import("@/config/axios-config");
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: mockUserInfo,
    });
    renderWithProviders(<Profile />);
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/api/v1/authors/author-123",
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });
  });
});
