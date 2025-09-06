import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmailVerification from "./EmailVerification";

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
  it("renders email verification success state", () => {
    renderWithProviders(<EmailVerification />);

    expect(screen.getByText("Email Verified!")).toBeDefined();
    expect(
      screen.getByText("Your email has been successfully verified!"),
    ).toBeDefined();
  });

  it("renders continue to login button", () => {
    renderWithProviders(<EmailVerification />);

    const loginButton = screen.getByText("Continue to Login");
    expect(loginButton).toBeDefined();
    expect(loginButton.tagName).toBe("BUTTON");
  });

  it("displays success icon", () => {
    renderWithProviders(<EmailVerification />);

    // Check for success icon (UserRoundCheck)
    const successIcon = document.querySelector(".text-green-600");
    expect(successIcon).toBeDefined();
  });

  it("has proper success message styling", () => {
    renderWithProviders(<EmailVerification />);

    const message = screen.getByText(
      "Your email has been successfully verified!",
    );
    expect(message.className).toContain("text-green-600");
  });

  it("renders with StudioCard wrapper", () => {
    renderWithProviders(<EmailVerification />);

    const heading = screen.getByText("Email Verified!");
    expect(heading.tagName).toBe("H2");
    expect(heading.className).toContain("text-xl");
  });

  it("button has correct styling", () => {
    renderWithProviders(<EmailVerification />);

    const loginButton = screen.getByText("Continue to Login");
    expect(loginButton.className).toContain("w-full");
  });

  it("displays verification message with proper styling", () => {
    renderWithProviders(<EmailVerification />);

    const message = screen.getByText(
      "Your email has been successfully verified!",
    );
    expect(message.tagName).toBe("P");
    expect(message.className).toContain("text-center");
    expect(message.className).toContain("mb-8");
  });

  it("heading has proper text alignment", () => {
    renderWithProviders(<EmailVerification />);

    const heading = screen.getByText("Email Verified!");
    expect(heading.className).toContain("text-center");
    expect(heading.className).toContain("font-semibold");
  });

  it("can click continue to login button", () => {
    renderWithProviders(<EmailVerification />);

    const loginButton = screen.getByText("Continue to Login");

    fireEvent.click(loginButton);
    expect(loginButton).toBeDefined();
  });

  it("renders in success state by default", () => {
    renderWithProviders(<EmailVerification />);

    expect(screen.getByText("Email Verified!")).toBeDefined();
    expect(screen.getByText("Continue to Login")).toBeDefined();

    expect(screen.queryByText("Verification Failed")).toBeNull();
  });

  it("renders error state with red styling", () => {
    const errorState = {
      status: "error" as const,
      message: "Verification failed. Please try again.",
    };
    renderWithProviders(<EmailVerification initialState={errorState} />);
    expect(screen.getByText("Verification Failed")).toBeInTheDocument();
    const message = screen.getByText("Verification failed. Please try again.");
    expect(message.className).toContain("text-red-600");
    expect(screen.queryByText("Continue to Login")).not.toBeInTheDocument();
  });
});
