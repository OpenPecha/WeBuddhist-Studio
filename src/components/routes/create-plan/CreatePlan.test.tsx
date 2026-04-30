import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, useBlocker, useParams } from "react-router-dom";
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
    useParams: vi.fn(() => ({})),
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
    vi.mocked(useParams).mockReturnValue({});
    vi.spyOn(axiosInstance, "post").mockImplementation((url) => {
      if (url.includes("/media/upload")) {
        return Promise.resolve({
          data: {
            image: {
              thumbnail: "mock-thumb-url",
              medium: "mock-medium-url",
              original: "mock-image-url",
            },
            key: "mock-image-key",
            path: "images/path",
            message: "Image uploaded successfully",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    vi.spyOn(axiosInstance, "get").mockResolvedValue({
      data: {
        id: "plan-123",
        title: "Existing Plan",
        description: "Existing description",
        total_days: 14,
        difficulty_level: "Beginner",
        plan_image_url: "https://example.com/image.jpg",
        image_url: "https://example.com/image.jpg",
        tags: ["meditation"],
        language: "en",
        start_date: "2026-04-30T00:00:00Z",
      },
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

    const submitButton = screen.getByText("studio.plan.update_button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.tagName).toBe("BUTTON");
  });

  it("allows typing in title input", () => {
    renderWithProviders(<CreatePlan />);

    const titleInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.title",
    );

    fireEvent.change(titleInput, { target: { value: "Test Plan Title" } });

    expect(titleInput).toHaveValue("Test Plan Title");
  });

  it("allows typing in description textarea", () => {
    renderWithProviders(<CreatePlan />);

    const descriptionTextarea = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.description",
    );

    fireEvent.change(descriptionTextarea, {
      target: { value: "Test plan description" },
    });

    expect(descriptionTextarea).toHaveValue("Test plan description");
  });

  it("allows typing in number of days input", () => {
    renderWithProviders(<CreatePlan />);

    const daysInput = screen.getByPlaceholderText(
      "studio.plan.form.placeholder.number_of_days",
    );

    fireEvent.change(daysInput, { target: { value: "30" } });

    expect(daysInput).toHaveValue(30);
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

  it("handles image upload error", async () => {
    vi.spyOn(axiosInstance, "post").mockImplementation((url) => {
      if (url.includes("/media/upload")) {
        return Promise.reject(new Error("Upload failed"));
      }
      return Promise.resolve({ data: {} });
    });
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
      expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
    });
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
    vi.mocked(useParams).mockReturnValue({ plan_id: "new" });
    renderWithProviders(<CreatePlan />);
    const submitButton = screen.getByText("studio.plan.next_button");
    fireEvent.click(submitButton);
    expect(
      await screen.findByText("Plan title is required"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Description is required"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Difficulty is required"),
    ).toBeInTheDocument();
  });

  it("handles tag input add and remove", () => {
    renderWithProviders(<CreatePlan />);
    const tagInput = screen.getByPlaceholderText("Add a tag");
    fireEvent.change(tagInput, { target: { value: "tag1" } });
    fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter" });
    expect(screen.getByText("Tag1")).toBeInTheDocument();
  });

  it("shows no image preview initially", () => {
    renderWithProviders(<CreatePlan />);
    expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
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
    const submitButton = screen.getByText("studio.plan.update_button");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(titleInput).toHaveValue("Test Plan");
      expect(descriptionTextarea).toHaveValue("Test Plan Description");
      expect(daysInput).toHaveValue(30);
      expect(submitButton).toBeInTheDocument();
    });
  });

  it("shows navigation dialog when blocker state is blocked", async () => {
    const mockBlocker = {
      state: "blocked" as const,
      proceed: vi.fn(),
      reset: vi.fn(),
      location: {} as any,
    };
    vi.mocked(useBlocker).mockReturnValue(mockBlocker);
    renderWithProviders(<CreatePlan />);
    await waitFor(() => {
      expect(
        screen.getByText("studio.plan.navigation.confirm_title"),
      ).toBeInTheDocument();
    });
  });

  it("handles navigation confirmation", async () => {
    const mockBlocker = {
      state: "blocked" as const,
      proceed: vi.fn(),
      reset: vi.fn(),
      location: {} as any,
    };
    vi.mocked(useBlocker).mockReturnValue(mockBlocker);
    renderWithProviders(<CreatePlan />);
    await waitFor(() => {
      expect(
        screen.getByText("studio.plan.navigation.confirm_title"),
      ).toBeInTheDocument();
    });
    const confirmButton = screen.getByText("studio.plan.navigation.leave");
    fireEvent.click(confirmButton);
    expect(mockBlocker.proceed).toHaveBeenCalled();
  });

  it("fetches and populates form in edit mode", async () => {
    vi.mocked(useParams).mockReturnValue({ plan_id: "plan-123" });

    renderWithProviders(<CreatePlan />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("studio.plan.form.placeholder.title"),
      ).toHaveValue("Existing Plan");
    });

    expect(
      screen.getByPlaceholderText("studio.plan.form.placeholder.description"),
    ).toHaveValue("Existing description");

    expect(
      screen.getByPlaceholderText(
        "studio.plan.form.placeholder.number_of_days",
      ),
    ).toHaveValue(14);

    expect(screen.getByAltText("Cover preview")).toBeInTheDocument();
  });

  it("handles navigation cancellation", async () => {
    const mockBlocker = {
      state: "blocked" as const,
      proceed: vi.fn(),
      reset: vi.fn(),
      location: {} as any,
    };
    vi.mocked(useBlocker).mockReturnValue(mockBlocker);
    renderWithProviders(<CreatePlan />);
    await waitFor(() => {
      expect(
        screen.getByText("studio.plan.navigation.confirm_title"),
      ).toBeInTheDocument();
    });
    const cancelButtons = screen.getAllByText("common.button.cancel");
    const dialogCancelButton = cancelButtons.find((btn) =>
      btn.closest('[role="dialog"]'),
    );
    fireEvent.click(dialogCancelButton!);
    expect(mockBlocker.reset).toHaveBeenCalled();
  });

  it("submits update in edit mode", async () => {
    vi.mocked(useParams).mockReturnValue({ plan_id: "plan-123" });
    vi.spyOn(axiosInstance, "put").mockResolvedValue({ data: {} });
    renderWithProviders(<CreatePlan />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("studio.plan.form.placeholder.title"),
      ).toHaveValue("Existing Plan");
    });

    fireEvent.change(
      screen.getByPlaceholderText("studio.plan.form.placeholder.title"),
      { target: { value: "Updated Plan" } },
    );

    const submitButton = screen.getByText("studio.plan.update_button");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith(
        "/api/v1/cms/plans/plan-123",
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  it("clears start_date when switching from specific to enroll mode on submit", async () => {
    vi.mocked(useParams).mockReturnValue({ plan_id: "plan-123" });
    const putSpy = vi
      .spyOn(axiosInstance, "put")
      .mockResolvedValue({ data: {} });

    renderWithProviders(<CreatePlan />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("studio.plan.form.placeholder.title"),
      ).toHaveValue("Existing Plan");
    });

    const enrollRadio = screen.getByLabelText(/When User Enrolls/i);
    await act(async () => {
      fireEvent.click(enrollRadio);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("studio.plan.update_button"));
    });

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        "/api/v1/cms/plans/plan-123",
        expect.objectContaining({ start_date: null }),
        expect.any(Object),
      );
    });
  });
});
