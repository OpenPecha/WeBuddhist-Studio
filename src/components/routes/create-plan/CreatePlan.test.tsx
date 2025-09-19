import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreatePlan from "./CreatePlan";
import { vi } from "vitest";
import axiosInstance from "@/config/axios-config";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useBlocker: vi.fn(() => ({
      state: "unblocked",
      proceed: vi.fn(),
      reset: vi.fn(),
    })),
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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

vi.mock(
  "@/components/ui/molecules/modals/image-upload/ImageContentData",
  () => ({
    default: ({ onUpload }: { onUpload: (file: File) => void }) => (
      <div>
        <button
          onClick={() => {
            const mockFile = new File(["sample file"], "sample.jpg", {
              type: "image/jpeg",
            });
            onUpload(mockFile);
          }}
          data-testid="mock-upload-trigger"
        >
          Upload
        </button>
      </div>
    ),
  }),
);

describe("CreatePlan Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(axiosInstance, "post").mockImplementation((url) => {
      if (url.includes("/media/upload")) {
        return Promise.resolve({
          data: {
            url: "mock-image-url",
            key: "mock-image-key",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });
  it("renders create plan form with main heading", () => {
    renderWithProviders(<CreatePlan />);

    expect(
      screen.getByText("studio.plan.form_field.details"),
    ).toBeInTheDocument();
  });

  it("renders title input field", () => {
    renderWithProviders(<CreatePlan />);

    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    );
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.tagName).toBe("INPUT");
  });

  it("renders description textarea", () => {
    renderWithProviders(<CreatePlan />);

    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );
    expect(descriptionTextarea).toBeInTheDocument();
    expect(descriptionTextarea.tagName).toBe("TEXTAREA");
  });

  it("renders number of days field with label", () => {
    renderWithProviders(<CreatePlan />);

    expect(
      screen.getByText("studio.plan.form_field.number_of_day"),
    ).toBeInTheDocument();

    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );
    expect(daysInput).toBeInTheDocument();
    expect(daysInput.getAttribute("type")).toBe("number");
  });

  it("renders cover image section", () => {
    renderWithProviders(<CreatePlan />);

    expect(
      screen.getByText("studio.dashboard.cover_image"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("studio.plan.cover_image.description"),
    ).toBeInTheDocument();
  });

  it("renders difficulty level field with label", () => {
    renderWithProviders(<CreatePlan />);

    expect(
      screen.getByText("studio.plan.form_field.difficulty"),
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders(<CreatePlan />);

    const submitButton = screen.getByText("studio.plan.next_button");
    expect(submitButton).toBeInTheDocument();
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
    expect(
      screen.getByText("studio.dashboard.cover_image"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("studio.plan.cover_image.description"),
    ).toBeInTheDocument();
    const uploadButton = screen.getByLabelText("Upload cover image");
    expect(uploadButton).toBeInTheDocument();
  });

  it("displays image preview after upload", async () => {
    renderWithProviders(<CreatePlan />);
    const uploadButton = screen.getByLabelText("Upload cover image");
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByText("Upload & Crop Image")).toBeInTheDocument();
    });
    const mockUploadButton = screen.getByTestId("mock-upload-trigger");

    await act(async () => {
      fireEvent.click(mockUploadButton);
    });

    await waitFor(() => {
      expect(screen.getByAltText("Cover preview")).toBeInTheDocument();
    });
    expect(screen.getByTestId("image-remove")).toBeInTheDocument();
    expect(screen.getByText("sample.jpg")).toBeInTheDocument();
    expect(screen.queryByText("Upload & Crop Image")).not.toBeInTheDocument();
  });

  it("removes image preview when remove button is clicked", async () => {
    renderWithProviders(<CreatePlan />);
    const uploadButton = screen.getByLabelText("Upload cover image");
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByTestId("mock-upload-trigger")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("mock-upload-trigger"));
    });

    await waitFor(() => {
      expect(screen.getByAltText("Cover preview")).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId("image-remove");
    expect(removeButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId("image-remove")).not.toBeInTheDocument();
    expect(screen.queryByText("sample.jpg")).not.toBeInTheDocument();
  });

  it("opens image upload dialog when upload button is clicked", async () => {
    renderWithProviders(<CreatePlan />);
    const uploadButton = screen.getByLabelText("Upload cover image");
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByText("Upload & Crop Image")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
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

  it("shows no image preview initially", () => {
    renderWithProviders(<CreatePlan />);
    expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
  });

  it("handles successful plan creation", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValue({
      data: {
        id: "1",
        title: "Test Plan",
        description: "Test Plan Description",
        total_days: 30,
        difficulty_level: "Beginner",
      },
    });
    renderWithProviders(<CreatePlan />);

    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    );
    fireEvent.change(titleInput, { target: { value: "Test Plan" } });
    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );
    fireEvent.change(descriptionTextarea, {
      target: { value: "Test Plan Description" },
    });
    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );
    fireEvent.change(daysInput, { target: { value: "30" } });
    const difficultyButton = screen.getByTestId("select-trigger");
    fireEvent.click(difficultyButton);
    const difficultyOption = screen.getByText("Beginner");
    fireEvent.click(difficultyOption);
    const submitButton = screen.getByText("studio.plan.next_button");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(titleInput).toHaveValue("");
      expect(descriptionTextarea).toHaveValue("");
      expect(daysInput).not.toHaveValue();
    });
  });

  it("handles failed plan creation", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(new Error("API Error"));
    renderWithProviders(<CreatePlan />);
    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    );
    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );
    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );
    fireEvent.change(titleInput, { target: { value: "Test Plan" } });
    fireEvent.change(descriptionTextarea, {
      target: { value: "Test Plan Description" },
    });
    fireEvent.change(daysInput, { target: { value: "30" } });
    const difficultyButton = screen.getByTestId("select-trigger");
    fireEvent.click(difficultyButton);
    const difficultyOption = screen.getByText("Beginner");
    fireEvent.click(difficultyOption);
    const submitButton = screen.getByText("studio.plan.next_button");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(titleInput).toHaveValue("Test Plan");
      expect(descriptionTextarea).toHaveValue("Test Plan Description");
      expect(daysInput).toHaveValue(30);
      expect(submitButton).toBeInTheDocument();
    });
  });
});
