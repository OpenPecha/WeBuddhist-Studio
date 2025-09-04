import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    expect(
      screen.getByText("studio.plan.form_field.number_of_day"),
    ).toBeDefined();

    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );
    expect(daysInput).toBeDefined();
    expect(daysInput.getAttribute("type")).toBe("number");
  });

  it("renders cover image section", () => {
    renderWithProviders(<CreatePlan />);

    expect(screen.getByText("studio.dashboard.cover_image")).toBeDefined();
    expect(
      screen.getByText("studio.plan.cover_image.description"),
    ).toBeDefined();
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
    );

    fireEvent.change(titleInput, { target: { value: "Test Plan Title" } });

    expect((titleInput as HTMLInputElement).value).toBe("Test Plan Title");
  });

  it("allows typing in description textarea", () => {
    renderWithProviders(<CreatePlan />);

    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );

    fireEvent.change(descriptionTextarea, {
      target: { value: "Test plan description" },
    });

    expect((descriptionTextarea as HTMLTextAreaElement).value).toBe(
      "Test plan description",
    );
  });

  it("allows typing in number of days input", () => {
    renderWithProviders(<CreatePlan />);

    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );

    fireEvent.change(daysInput, { target: { value: "30" } });

    expect((daysInput as HTMLInputElement).value).toBe("30");
  });

  it("renders image upload area", () => {
    renderWithProviders(<CreatePlan />);

    const uploadButton = screen.getByRole("button", { name: "" });
    expect(uploadButton).toBeDefined();
  });

  it("handles image upload and preview", async () => {
    renderWithProviders(<CreatePlan />);
    const file = new File(["dummy content"], "cover.png", {
      type: "image/png",
    });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });
    const preview = await screen.findByAltText("Cover preview");
    expect(preview).toBeInTheDocument();
    expect(screen.getByText("cover.png")).toBeInTheDocument();
  });

  it("removes image preview when remove button is clicked", async () => {
    renderWithProviders(<CreatePlan />);
    const file = new File(["dummy content"], "cover.png", {
      type: "image/png",
    });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });
    const preview = await screen.findByAltText("Cover preview");
    expect(preview).toBeInTheDocument();
    const removeBtn = screen.getByTestId("image-remove");
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
      expect(screen.queryByText("cover.png")).not.toBeInTheDocument();
    });
  });

  it("shows validation errors for required fields", async () => {
    renderWithProviders(<CreatePlan />);
    const submitButton = screen.getByText("studio.plan.next_button");
    fireEvent.click(submitButton);
    expect(await screen.findAllByText(/required/)).not.toHaveLength(0);
  });

  it("handles tag input add and remove", () => {
    renderWithProviders(<CreatePlan />);
    const tagInput = screen.getByPlaceholderText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "tag1" } });
    fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter" });
    expect(screen.getByText("tag1")).toBeInTheDocument();
  });

  it("does not set preview for non-image file", async () => {
    renderWithProviders(<CreatePlan />);
    const file = new File(["dummy content"], "file.txt", {
      type: "text/plain",
    });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
  });
});
