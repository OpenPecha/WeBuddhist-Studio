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
    queryClient.setQueryData(["userInfo"], queryData);
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

  it("shows user info from shared userInfo query", async () => {
    renderWithProviders(<Profile />, mockUserInfo);
    await waitFor(() => {
      expect(screen.getByText("Tenzin la")).toBeInTheDocument();
    });
  });
});
