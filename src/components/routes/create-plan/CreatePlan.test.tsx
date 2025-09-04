import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreatePlan from "./CreatePlan";

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

describe("CreatePlan Component", () => {
  it("renders create plan form with main heading", () => {
    renderWithProviders(<CreatePlan />);

    expect(screen.getByText("studio.plan.form_field.details")).toBeDefined();
  });

  it("renders title input field", () => {
    renderWithProviders(<CreatePlan />);

    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    );
    expect(titleInput).toBeDefined();
    expect(titleInput.tagName).toBe("INPUT");
  });

  it("renders description textarea", () => {
    renderWithProviders(<CreatePlan />);

    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );
    expect(descriptionTextarea).toBeDefined();
    expect(descriptionTextarea.tagName).toBe("TEXTAREA");
  });

  it("renders number of days field with label", () => {
    renderWithProviders(<CreatePlan />);

    expect(screen.getByText("studio.plan.form_field.number_of_day")).toBeDefined();
    
    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );
    expect(daysInput).toBeDefined();
    expect(daysInput.getAttribute("type")).toBe("number");
  });

  it("renders cover image section", () => {
    renderWithProviders(<CreatePlan />);

    expect(screen.getByText("studio.dashboard.cover_image")).toBeDefined();
    expect(screen.getByText("studio.plan.cover_image.description")).toBeDefined();
  });

  it("renders difficulty level field with label", () => {
    renderWithProviders(<CreatePlan />);

    expect(screen.getByText("studio.plan.form_field.difficulty")).toBeDefined();
  });

  it("renders submit button", () => {
    renderWithProviders(<CreatePlan />);

    const submitButton = screen.getByText("studio.plan.next_button");
    expect(submitButton).toBeDefined();
    expect(submitButton.tagName).toBe("BUTTON");
  });

  it("allows typing in title input", () => {
    renderWithProviders(<CreatePlan />);

    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    ) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "Test Plan Title" } });

    expect(titleInput.value).toBe("Test Plan Title");
  });

  it("allows typing in description textarea", () => {
    renderWithProviders(<CreatePlan />);

    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    ) as HTMLTextAreaElement;

    fireEvent.change(descriptionTextarea, {
      target: { value: "Test plan description" },
    });

    expect(descriptionTextarea.value).toBe("Test plan description");
  });

  it("allows typing in number of days input", () => {
    renderWithProviders(<CreatePlan />);

    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    ) as HTMLInputElement;

    fireEvent.change(daysInput, { target: { value: "30" } });

    expect(daysInput.value).toBe("30");
  });


  it("renders image upload area", () => {
    renderWithProviders(<CreatePlan />);

    const uploadButton = screen.getByRole("button", { name: "" });
    expect(uploadButton).toBeDefined();
  });
});
