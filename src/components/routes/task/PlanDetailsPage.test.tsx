import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import PlanDetailsPage from "./PlanDetailsPage";

const mockPlanData = {
  id: "e7c343c4-e17b-4e1e-ab9a-e844180c7b3a",
  title: "4-Day Practice Plan: Daily Motivation Boost",
  description: "this is a demo",
  days: [
    {
      id: "94194915-563b-4d92-967f-35f38a5e28e3",
      day_number: 1,
      tasks: [
        {
          id: "task1",
          title: "Morning Intention Setting",
          subtasks: [],
          estimated_time: 30,
          display_order: 1,
        },
        {
          id: "task2",
          title: "Compassion Reflection",
          subtasks: [],
          estimated_time: 20,
          display_order: 2,
        },
      ],
    },
    {
      id: "31efe825-5bbc-4610-ab1c-c09afb157418",
      day_number: 2,
      tasks: [
        {
          id: "task3",
          title: "Meaningful Living Practice",
          subtasks: [],
          estimated_time: 45,
          display_order: 1,
        },
      ],
    },
    {
      id: "32dc2643-be72-4f11-95d9-1a4a5ca5e871",
      day_number: 3,
      tasks: [
        {
          id: "task4",
          title: "Heart Transformation Exercise",
          subtasks: [],
          estimated_time: 35,
          display_order: 1,
        },
      ],
    },
    {
      id: "be13212e-a744-427f-a214-bfb4ac2857b2",
      day_number: 4,
      tasks: [
        {
          id: "task5",
          title: "Integration and Commitment",
          subtasks: [],
          estimated_time: 35,
          display_order: 1,
        },
      ],
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
  toast: { error: vi.fn() },
}));

vi.mock("./components/TaskForm", () => ({
  default: ({ selectedDay }: { selectedDay: number }) => (
    <div>
      <h2>Add Task</h2>
      <p>Selected Day: {selectedDay}</p>
    </div>
  ),
}));

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe("PlanDetailsPanel Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: axiosInstance } = await import("@/config/axios-config");
    const mockAxios = axiosInstance as any;
    mockAxios.get.mockResolvedValue({ data: mockPlanData });
    mockAxios.post.mockResolvedValue({
      data: { id: "new-day-id", day_number: 5, tasks: [] },
    });
  });

  it("renders plan details panel with current plan title and days", async () => {
    renderWithProviders(<PlanDetailsPage />);
    expect(screen.getByText("Current Plan")).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(mockPlanData.title)).toBeInTheDocument();
    });
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("Day 3")).toBeInTheDocument();
    expect(screen.getByText("Day 4")).toBeInTheDocument();
  });

  it("shows tasks when a day is selected and expanded", async () => {
    renderWithProviders(<PlanDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(mockPlanData.title)).toBeInTheDocument();
    });
    expect(screen.getByText("Morning Intention Setting")).toBeInTheDocument();
    expect(screen.getByText("Compassion Reflection")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Day 2"));
    await waitFor(() => {
      expect(
        screen.getByText("Meaningful Living Practice"),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText("Morning Intention Setting"),
    ).not.toBeInTheDocument();
  });

  it("calls API when Add New Day button is clicked", async () => {
    const { default: axiosInstance } = await import("@/config/axios-config");
    const mockAxios = axiosInstance as any;
    renderWithProviders(<PlanDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Day 4")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add New Day"));
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/cms/plans/test-plan-id/days"),
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        }),
      );
    });
  });

  it("renders DefaultDayView when selected day has no tasks", async () => {
    const { default: axiosInstance } = await import("@/config/axios-config");
    const mockAxios = axiosInstance as any;
    mockAxios.get.mockResolvedValue({
      data: {
        ...mockPlanData,
        days: [{ id: "day-1", day_number: 1, tasks: [] }],
      },
    });
    renderWithProviders(<PlanDetailsPage />);
    await waitFor(() => {
      expect(
        screen.getByText("No tasks created for Day 1"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Click the + icon next to the day to add your first task",
        ),
      ).toBeInTheDocument();
    });
  });

  it("handles create new day error", async () => {
    const { default: axiosInstance } = await import("@/config/axios-config");
    const { toast } = await import("sonner");
    const mockAxios = axiosInstance as any;
    mockAxios.get.mockResolvedValue({ data: mockPlanData });
    mockAxios.post.mockRejectedValueOnce({
      response: { data: { detail: "Cannot create day" } },
    });
    renderWithProviders(<PlanDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText("Day 4")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Add New Day"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create new day", {
        description: "Cannot create day",
      });
    });
  });

  it("shows TaskForm when add task button is clicked", async () => {
    renderWithProviders(<PlanDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(mockPlanData.title)).toBeInTheDocument();
    });
    const addButton = screen.getByTestId("add-task-button");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Add Task")).toBeInTheDocument();
    });
  });
});
