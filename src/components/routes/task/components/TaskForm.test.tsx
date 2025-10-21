import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TaskForm from "./TaskForm";
import { vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@/components/ui/molecules/form-upload/InlineImageUpload", () => ({
  default: ({
    onUpload,
  }: {
    onUpload?: (file: File) => void;
    uploadedImage?: File | null;
  }) => (
    <div>
      <div>Drag 'n' drop an image here, or click to select</div>
      <button
        onClick={() => {
          const mockFile = new File(["sample file"], "sample.jpg", {
            type: "image/jpeg",
          });
          onUpload?.(mockFile);
        }}
        data-testid="mock-upload-trigger"
      >
        Upload
      </button>
    </div>
  ),
}));

vi.mock("@/config/axios-config", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(() => "mock-token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  queryClient.setQueryData(["planDetails", "test-plan-id"], {
    id: "test-plan-id",
    days: [
      {
        id: "day-1",
        day_number: 1,
      },
    ],
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/plan/test-plan-id"]}>
        <Routes>
          <Route path="/plan/:plan_id" element={component} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("TaskForm Component", () => {
  it("renders task form with Add Task heading", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);

    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("renders task title input field", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.tagName).toBe("INPUT");
  });

  it("renders submit button", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.tagName).toBe("BUTTON");
    expect(submitButton).toHaveTextContent("Submit");
  });

  it("shows content type buttons when add button is clicked", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    expect(screen.queryByText("Enter YouTube URL")).not.toBeInTheDocument();
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    expect(screen.getByTestId("image-button")).toBeInTheDocument();
    expect(screen.getByTestId("music-button")).toBeInTheDocument();
    expect(screen.getByTestId("video-button")).toBeInTheDocument();
    expect(screen.getByTestId("text-button")).toBeInTheDocument();
    expect(screen.getByTestId("pecha-button")).toBeInTheDocument();
  });

  it("allows typing in title input", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "Test Task Title" } });
    expect(titleInput).toHaveValue("Test Task Title");
  });

  it("shows video input when video content type is selected", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    expect(
      screen.getByPlaceholderText("Enter YouTube URL"),
    ).toBeInTheDocument();
  });

  it("shows text input when text content type is selected", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const textButton = screen.getByTestId("text-button");
    fireEvent.click(textButton);
    expect(
      screen.getByPlaceholderText("Enter your text content"),
    ).toBeInTheDocument();
  });

  it("shows music input when music content type is selected", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const musicButton = screen.getByTestId("music-button");
    fireEvent.click(musicButton);
    expect(
      screen.getByPlaceholderText("Enter Spotify or SoundCloud URL"),
    ).toBeInTheDocument();
  });

  it("allows entering YouTube URL without validation", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    const videoInput = screen.getByPlaceholderText("Enter YouTube URL");
    fireEvent.change(videoInput, { target: { value: "invalid-url" } });
    expect(videoInput).toHaveValue("invalid-url");
  });

  it("allows entering music URL without validation", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const musicButton = screen.getByTestId("music-button");
    fireEvent.click(musicButton);
    const musicInput = screen.getByPlaceholderText(
      "Enter Spotify or SoundCloud URL",
    );
    fireEvent.change(musicInput, { target: { value: "invalid-url" } });
    expect(musicInput).toHaveValue("invalid-url");
  });

  it("allows typing in text content textarea", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const textButton = screen.getByTestId("text-button");
    fireEvent.click(textButton);
    const textArea = screen.getByPlaceholderText("Enter your text content");
    fireEvent.change(textArea, { target: { value: "Test content" } });
    expect(textArea).toHaveValue("Test content");
  });

  it("shows image upload section when image button is clicked", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    expect(
      screen.getByText("Drag 'n' drop an image here, or click to select"),
    ).toBeInTheDocument();
  });

  it("disables submit button when form is invalid", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Task Title"), {
      target: { value: "Test Task" },
    });
    expect(screen.getByPlaceholderText("Task Title")).toHaveValue("Test Task");
  });

  it("shows YouTube preview for valid URL", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    const videoInput = screen.getByPlaceholderText("Enter YouTube URL");
    fireEvent.change(videoInput, {
      target: { value: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
    });
    expect(screen.getByTitle("YouTube preview")).toBeInTheDocument();
  });

  it("adds multiple subtasks when same content type is clicked", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    const initialVideoInputs =
      screen.getAllByPlaceholderText("Enter YouTube URL");
    expect(initialVideoInputs).toHaveLength(1);
    fireEvent.click(videoButton);
    const videoInputs = screen.getAllByPlaceholderText("Enter YouTube URL");
    expect(videoInputs).toHaveLength(2);
  });

  it("shows Spotify embed for valid Spotify URL", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const musicButton = screen.getByTestId("music-button");
    fireEvent.click(musicButton);
    const musicInput = screen.getByPlaceholderText(
      "Enter Spotify or SoundCloud URL",
    );
    fireEvent.change(musicInput, {
      target: {
        value: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
      },
    });
    expect(
      document.querySelector('iframe[src*="spotify.com/embed"]'),
    ).toBeInTheDocument();
  });

  it("handles image upload successfully", async () => {
    const axiosInstance = await import("@/config/axios-config");
    vi.mocked(axiosInstance.default.post).mockResolvedValue({
      data: { url: "https://example.com/image.jpg", key: "image-key-123" },
    });
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    const uploadButton = screen.getByTestId("mock-upload-trigger");
    fireEvent.click(uploadButton);
    await waitFor(() => {
      expect(screen.getByAltText("Final uploaded image")).toBeInTheDocument();
    });
  });

  it("preserves form input values when submit fails", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Task Title"), {
      target: { value: "Test Task" },
    });
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const videoButton = screen.getByTestId("video-button");
    fireEvent.click(videoButton);
    fireEvent.change(screen.getByPlaceholderText("Enter YouTube URL"), {
      target: { value: "https://youtube.com/watch?v=test123" },
    });
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);
    expect(screen.getByPlaceholderText("Enter YouTube URL")).toHaveValue(
      "https://youtube.com/watch?v=test123",
    );
  });

  it("handles image removal and error states", async () => {
    const axiosInstance = await import("@/config/axios-config");
    vi.mocked(axiosInstance.default.post).mockResolvedValueOnce({
      data: { url: "https://example.com/image.jpg", key: "image-key-123" },
    });
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    fireEvent.click(screen.getByTestId("mock-upload-trigger"));
    await waitFor(() => {
      expect(screen.getByAltText("Final uploaded image")).toBeInTheDocument();
    });
    const removeButton = screen.getByTestId("remove-image-button");
    fireEvent.click(removeButton);
    expect(
      screen.queryByAltText("Final uploaded image"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Drag 'n' drop an image here, or click to select"),
    ).toBeInTheDocument();
  });

  it("handles image upload error and mutation error", async () => {
    const axiosInstance = await import("@/config/axios-config");
    vi.mocked(axiosInstance.default.post).mockRejectedValueOnce(
      new Error("Upload failed"),
    );
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const addButton = screen.getByTestId("add-content-button");
    fireEvent.click(addButton);
    const imageButton = screen.getByTestId("image-button");
    fireEvent.click(imageButton);
    fireEvent.click(screen.getByTestId("mock-upload-trigger"));
    await waitFor(() => {
      expect(
        screen.getByText("Drag 'n' drop an image here, or click to select"),
      ).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Task Title"), {
      target: { value: "Test Task" },
    });
    vi.mocked(axiosInstance.default.post).mockRejectedValueOnce(
      new Error("Task creation failed"),
    );
    fireEvent.click(screen.getByTestId("submit-button"));
    expect(screen.getByPlaceholderText("Task Title")).toHaveValue("Test Task");
  });

  it("saves form title to localStorage when typing", () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "My Task" } });
    expect(localStorage.getItem("day_1_title")).toBe("My Task");
  });

  it("loads title from localStorage on initial render", () => {
    localStorage.setItem("day_1_title", "Restored Task");
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    expect(screen.getByPlaceholderText("Task Title")).toHaveValue(
      "Restored Task",
    );
  });

  it("submits form successfully with subtasks", async () => {
    const axiosInstance = await import("@/config/axios-config");
    const { toast } = await import("sonner");
    vi.mocked(axiosInstance.default.post)
      .mockResolvedValueOnce({ data: { id: "task-123" } })
      .mockResolvedValueOnce({ data: {} });
    renderWithProviders(<TaskForm selectedDay={1} onCancel={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Task Title"), {
      target: { value: "Test Task" },
    });
    fireEvent.click(screen.getByTestId("add-content-button"));
    fireEvent.click(screen.getByTestId("text-button"));
    fireEvent.change(screen.getByPlaceholderText("Enter your text content"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(axiosInstance.default.post).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("updates existing task by adding new subtask", async () => {
    const axiosInstance = await import("@/config/axios-config");
    const { toast } = await import("sonner");
    const existingTask = {
      id: "task-123",
      title: "My Task",
      subtasks: [
        {
          id: "existing-subtask-1",
          content: "Existing content",
          content_type: "TEXT",
          display_order: 1,
        },
      ],
    };
    vi.mocked(axiosInstance.default.get).mockResolvedValue({
      data: existingTask,
    });
    vi.mocked(axiosInstance.default.post).mockResolvedValue({
      data: {
        sub_tasks: [
          {
            id: "new-subtask-2",
            content: "https://youtube.com/watch?v=abc123",
            content_type: "VIDEO",
            display_order: 0,
          },
        ],
      },
    });
    vi.mocked(axiosInstance.default.put).mockResolvedValue({ data: {} });
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={{ id: "task-123", title: "My Task" }}
        onCancel={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("add-content-button"));
    fireEvent.click(screen.getByTestId("video-button"));
    fireEvent.change(screen.getByPlaceholderText("Enter YouTube URL"), {
      target: { value: "https://youtube.com/watch?v=abc123" },
    });
    expect(screen.getByTestId("submit-button")).toHaveTextContent("Update");
    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Task updated successfully!");
    });
    expect(axiosInstance.default.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.default.put).toHaveBeenCalledTimes(1);
    expect(axiosInstance.default.post).toHaveBeenCalledWith(
      "/api/v1/cms/sub-tasks",
      {
        task_id: "task-123",
        sub_tasks: [
          {
            content: "https://youtube.com/watch?v=abc123",
            content_type: "VIDEO",
          },
        ],
      },
      expect.any(Object),
    );
    expect(axiosInstance.default.put).toHaveBeenCalledWith(
      "/api/v1/cms/sub-tasks",
      {
        task_id: "task-123",
        sub_tasks: [
          {
            id: "existing-subtask-1",
            content: "Existing content",
            content_type: "TEXT",
            display_order: 1,
          },
          {
            id: "new-subtask-2",
            content: "https://youtube.com/watch?v=abc123",
            content_type: "VIDEO",
            display_order: 2,
          },
        ],
      },
      expect.any(Object),
    );
  });
});
