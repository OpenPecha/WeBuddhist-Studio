import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import TaskView from "./TaskView";
import axiosInstance from "@/config/axios-config";

const mockTaskDetails = {
  id: "task-123",
  title: "Test Task Title",
  subtasks: [
    {
      id: "subtask-1",
      content: "This is a text content",
      content_type: "TEXT",
    },
    {
      id: "subtask-2",
      content: "https://example.com/video.mp4",
      content_type: "VIDEO",
    },
  ],
};

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn((key) => {
      if (key === "accessToken") return "mock-token";
      return null;
    }),
  },
  writable: true,
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
};

describe("TaskView Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: axiosInstance } = await import("@/config/axios-config");
    const mockAxios = axiosInstance as any;
    mockAxios.get.mockResolvedValue({ data: mockTaskDetails });
  });

  it("renders loading skeleton when data is loading", () => {
    const { container } = renderWithProviders(<TaskView taskId="task-123" />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders task title and subtasks after loading", async () => {
    renderWithProviders(<TaskView taskId="task-123" />);
    await waitFor(() => {
      expect(screen.getByText("Test Task Title")).toBeInTheDocument();
    });
    expect(screen.getByText("This is a text content")).toBeInTheDocument();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/cms/tasks/task-123",
      {
        headers: {
          Authorization: "Bearer mock-token",
        },
      },
    );
  });

  it("does not fetch when taskId is not provided", () => {
    renderWithProviders(<TaskView taskId="" />);
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("handles empty subtask content correctly", async () => {
    const mockTaskWithEmptyContent = {
      id: "task-123",
      title: "Task With Empty Content",
      subtasks: [
        {
          id: "subtask-empty",
          content: "",
          content_type: "TEXT",
        },
        {
          id: "subtask-valid",
          content: "Valid content",
          content_type: "TEXT",
        },
      ],
    };
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: mockTaskWithEmptyContent,
    });
    renderWithProviders(<TaskView taskId="task-123" />);
    await waitFor(() => {
      expect(screen.getByText("Task With Empty Content")).toBeInTheDocument();
    });
    expect(screen.getByText("Valid content")).toBeInTheDocument();
  });
});
