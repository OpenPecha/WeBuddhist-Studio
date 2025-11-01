import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import TaskForm from "./TaskForm";

const mockPlanData = {
  id: "test-plan-id",
  title: "Test Plan",
  days: [
    {
      id: "day-1",
      day_number: 1,
      tasks: [],
    },
  ],
};

const mockTaskDetails = {
  id: "task-123",
  title: "Test Task",
  subtasks: [
    {
      id: "subtask-1",
      content: "Test content",
      content_type: "TEXT",
    },
  ],
};

const mockTaskWithAllTypes = {
  id: "task-123",
  title: "Test Task",
  subtasks: [
    {
      id: "sub-1",
      content: "Text content",
      content_type: "TEXT",
    },
    {
      id: "sub-2",
      content: "https://video.mp4",
      content_type: "VIDEO",
    },
    {
      id: "sub-3",
      content: "https://audio.mp3",
      content_type: "AUDIO",
    },
    {
      id: "sub-4",
      content: "https://image.jpg",
      content_type: "IMAGE",
      image_key: "key-123",
    },
  ],
};

const mockEditingTask = {
  id: "task-123",
  title: "Editing Task",
};

const mockTaskWithUnknownType = {
  id: "task-123",
  title: "Test Task",
  subtasks: [
    {
      id: "sub-unknown",
      content: "Some content",
      content_type: "UNKNOWN_TYPE",
    },
  ],
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ plan_id: "test-plan-id" }),
  };
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/routes/task/api/taskApi", () => ({
  createTask: vi.fn(),
  uploadImageToS3: vi.fn(),
  createSubTasks: vi.fn(),
  updateSubTasks: vi.fn(),
  fetchTaskDetails: vi.fn(),
}));

vi.mock("@/components/ui/molecules/content-sub/ContentTypeSelector", () => ({
  ContentTypeSelector: ({ onSelectType }: any) => (
    <div>
      <button onClick={() => onSelectType("TEXT")}>Add Text</button>
      <button onClick={() => onSelectType("VIDEO")}>Add Video</button>
      <button onClick={() => onSelectType("AUDIO")}>Add Audio</button>
      <button onClick={() => onSelectType("IMAGE")}>Add Image</button>
    </div>
  ),
}));

vi.mock("@/components/routes/task/components/ui/TaskTitleField", () => ({
  TaskTitleField: ({ control }: any) => (
    <input placeholder="Task Title" {...control.register("title")} />
  ),
}));

vi.mock("@/components/ui/molecules/subtask-card/SubTaskCard", () => ({
  SubTaskCard: ({
    subTask,
    onImageUpload,
    onRemoveImage,
    onRemove,
    onUpdate,
    index,
  }: any) => (
    <div>
      {subTask.content_type === "TEXT" && (
        <>
          <input
            placeholder="Enter your text content"
            value={subTask.content}
            onChange={(e) => onUpdate(index, { content: e.target.value })}
          />
          <button
            data-testid="remove-subtask-button"
            onClick={() => onRemove(index)}
          >
            Remove Subtask
          </button>
        </>
      )}
      {subTask.content_type === "VIDEO" && (
        <>
          <input
            placeholder="Enter video URL"
            value={subTask.content}
            data-testid="video-input"
          />
          <button
            data-testid="remove-subtask-button"
            onClick={() => onRemove(index)}
          >
            Remove Subtask
          </button>
        </>
      )}
      {subTask.content_type === "AUDIO" && (
        <>
          <input
            placeholder="Enter audio URL"
            value={subTask.content}
            data-testid="audio-input"
          />
          <button
            data-testid="remove-subtask-button"
            onClick={() => onRemove(index)}
          >
            Remove Subtask
          </button>
        </>
      )}
      {subTask.content_type === "IMAGE" && (
        <>
          <input
            data-testid="image-upload-input"
            type="file"
            title="Upload image file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onImageUpload(index, e.target.files[0]);
              }
            }}
          />
          <button
            data-testid="remove-image-button"
            onClick={() => onRemoveImage(index)}
          >
            Remove Image
          </button>
        </>
      )}
    </div>
  ),
}));

const renderWithProviders = (
  component: React.ReactElement,
  additionalQueryData?: Record<string, any>,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  queryClient.setQueryData(["planDetails", "test-plan-id"], mockPlanData);

  if (additionalQueryData) {
    Object.entries(additionalQueryData).forEach(([key, value]) => {
      queryClient.setQueryData(JSON.parse(key), value);
    });
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe("TaskForm Component", () => {
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task form with title input", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    expect(screen.getByText("Add Task")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Task Title")).toBeInTheDocument();
  });

  it("allows adding subtasks when content type is selected", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const addTextButton = screen.getByText("Add Text");
    fireEvent.click(addTextButton);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your text content"),
      ).toBeInTheDocument();
    });
  });

  it("adds all types of subtasks correctly", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText("Add Text"));
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your text content"),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add Video"));
    await waitFor(() => {
      expect(screen.getByTestId("video-input")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add Audio"));
    await waitFor(() => {
      expect(screen.getByTestId("audio-input")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add Image"));
    await waitFor(() => {
      expect(screen.getByTestId("image-upload-input")).toBeInTheDocument();
    });
  });

  it("updates subtask content correctly", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText("Add Text"));
    await waitFor(() => {
      const textInput = screen.getByPlaceholderText("Enter your text content");
      expect(textInput).toBeInTheDocument();
      fireEvent.change(textInput, { target: { value: "Updated content" } });
      expect(textInput).toHaveValue("Updated content");
    });
  });

  it("submits form with task data when in create mode", async () => {
    const { createTask, createSubTasks } = await import("../../api/taskApi");
    vi.mocked(createTask).mockResolvedValue({ id: "new-task-id" });
    vi.mocked(createSubTasks).mockResolvedValue(undefined);
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "New Task" } });
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        plan_id: "test-plan-id",
        day_id: "day-1",
        title: "New Task",
        estimated_time: 30,
      });
    });
  });

  it("populates form with all content types in edit mode", async () => {
    const { fetchTaskDetails } = await import("../../api/taskApi");
    vi.mocked(fetchTaskDetails).mockResolvedValue(mockTaskWithAllTypes);
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={mockEditingTask}
        onCancel={mockOnCancel}
      />,
      {
        '["taskDetails","task-123"]': mockTaskWithAllTypes,
      },
    );
    await waitFor(() => {
      expect(screen.getByText("Editing Task")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your text content"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("video-input")).toBeInTheDocument();
      expect(screen.getByTestId("audio-input")).toBeInTheDocument();
      expect(screen.getByTestId("image-upload-input")).toBeInTheDocument();
    });
  });

  it("submits form with subtask data when in edit mode", async () => {
    const { updateSubTasks, fetchTaskDetails } = await import(
      "../../api/taskApi"
    );
    vi.mocked(fetchTaskDetails).mockResolvedValue(mockTaskDetails);
    vi.mocked(updateSubTasks).mockResolvedValue(undefined);
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={mockEditingTask}
        onCancel={mockOnCancel}
      />,
      {
        '["taskDetails","task-123"]': mockTaskDetails,
      },
    );
    await waitFor(() => {
      expect(screen.getByText("Update")).toBeInTheDocument();
    });
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);
    await waitFor(() => {
      expect(updateSubTasks).toHaveBeenCalledWith("task-123", [
        {
          content: "Test content",
          content_type: "TEXT",
          display_order: 1,
          id: "subtask-1",
        },
      ]);
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const { fetchTaskDetails } = await import("../../api/taskApi");
    vi.mocked(fetchTaskDetails).mockResolvedValue(mockTaskDetails);
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={mockEditingTask}
        onCancel={mockOnCancel}
      />,
      {
        '["taskDetails","task-123"]': mockTaskDetails,
      },
    );
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("shows error message when task creation fails", async () => {
    const { createTask } = await import("../../api/taskApi");
    const { toast } = await import("sonner");
    vi.mocked(createTask).mockRejectedValue(new Error("Failed to create task"));
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const titleInput = screen.getByPlaceholderText("Task Title");
    fireEvent.change(titleInput, { target: { value: "New Task" } });
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create task", {
        description: "Failed to create task",
      });
    });
  });

  it("uploads image for subtask", async () => {
    const { uploadImageToS3 } = await import("../../api/taskApi");
    const { toast } = await import("sonner");
    vi.mocked(uploadImageToS3).mockResolvedValue({
      url: "https://example.com/image.jpg",
      key: "image-key-123",
    });
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const addImageButton = screen.getByText("Add Image");
    fireEvent.click(addImageButton);
    await waitFor(() => {
      const imageInput = screen.getByTestId("image-upload-input");
      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(imageInput, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(uploadImageToS3).toHaveBeenCalledWith(
        expect.any(File),
        "test-plan-id",
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Image uploaded successfully!",
      );
    });
  });

  it("removes image from subtask", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const addImageButton = screen.getByText("Add Image");
    fireEvent.click(addImageButton);
    await waitFor(() => {
      const removeButton = screen.getByTestId("remove-image-button");
      fireEvent.click(removeButton);
    });
  });

  it("removes subtask when remove button is clicked", async () => {
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const addTextButton = screen.getByText("Add Text");
    fireEvent.click(addTextButton);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter your text content"),
      ).toBeInTheDocument();
    });
    const removeButton = screen.getByTestId("remove-subtask-button");
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Enter your text content"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error message when task update fails", async () => {
    const { updateSubTasks, fetchTaskDetails } = await import(
      "../../api/taskApi"
    );
    const { toast } = await import("sonner");
    vi.mocked(fetchTaskDetails).mockResolvedValue(mockTaskDetails);
    vi.mocked(updateSubTasks).mockRejectedValue(
      new Error("Failed to update task"),
    );
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={mockEditingTask}
        onCancel={mockOnCancel}
      />,
      {
        '["taskDetails","task-123"]': mockTaskDetails,
      },
    );
    await waitFor(() => {
      expect(screen.getByText("Update")).toBeInTheDocument();
    });
    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update task", {
        description: "Failed to update task",
      });
    });
  });

  it("shows error message when image upload fails", async () => {
    const { uploadImageToS3 } = await import("../../api/taskApi");
    const { toast } = await import("sonner");
    vi.mocked(uploadImageToS3).mockRejectedValue(new Error("Upload failed"));
    renderWithProviders(<TaskForm selectedDay={1} onCancel={mockOnCancel} />);
    const addImageButton = screen.getByText("Add Image");
    fireEvent.click(addImageButton);
    await waitFor(() => {
      const imageInput = screen.getByTestId("image-upload-input");
      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(imageInput, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to upload image");
    });
  });

  it("handles unknown content type with default case", async () => {
    const { fetchTaskDetails } = await import("../../api/taskApi");
    vi.mocked(fetchTaskDetails).mockResolvedValue(mockTaskWithUnknownType);
    renderWithProviders(
      <TaskForm
        selectedDay={1}
        editingTask={mockEditingTask}
        onCancel={mockOnCancel}
      />,
      {
        '["taskDetails","task-123"]': mockTaskWithUnknownType,
      },
    );
    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your text content"),
      ).toBeInTheDocument();
    });
  });
});
