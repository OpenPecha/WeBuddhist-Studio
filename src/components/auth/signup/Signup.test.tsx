import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signup from "./Signup";

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

describe("Signup Component", () => {
  it("renders signup form with all required fields", () => {
    renderWithProviders(<Signup />);

    expect(
      screen.getByPlaceholderText("studio.login.placeholder.email"),
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("studio.signup.placeholder.first_name"),
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("studio.signup.placeholder.last_name"),
    ).toBeDefined();
    expect(
      screen.getAllByPlaceholderText("studio.signup.placeholder.password"),
    ).toHaveLength(2);
    expect(screen.getByText("common.button.submit")).toBeDefined();
  });

  it("displays the app title and description", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByText("Webuddhist Studio")).toBeDefined();
    expect(
      screen.getByText("Learn, live and share Buddhist wisdom daily"),
    ).toBeDefined();
  });

  it("shows login link", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByText("sign_up.already_have_account")).toBeDefined();
  });

  it("renders all form labels correctly", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByText("common.email")).toBeDefined();
    expect(screen.getByText("sign_up.form.first_name")).toBeDefined();
    expect(screen.getByText("sign_up.form.last_name")).toBeDefined();
    expect(screen.getByText("common.password")).toBeDefined();
    expect(screen.getByText("common.confirm_password")).toBeDefined();
  });

  it("displays signup title", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByText("studio.signup.title")).toBeDefined();
  });
});
