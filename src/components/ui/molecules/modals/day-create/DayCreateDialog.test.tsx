import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import DayCreateDialog from "./DayCreateDialog";

const mockSearchPlans = vi.fn();
const mockFetchPlanDetails = vi.fn();

vi.mock("@/components/routes/task/api/planApi", () => ({
  searchCmsPlans: (...args: unknown[]) => mockSearchPlans(...args),
  fetchPlanDetails: (...args: unknown[]) => mockFetchPlanDetails(...args),
}));

function renderDialog(onSubmit = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DayCreateDialog onSubmit={onSubmit} />
    </QueryClientProvider>,
  );
}

describe("DayCreateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchPlans.mockResolvedValue({
      plans: [
        {
          id: "source-plan-id",
          title: "Source Plan",
          language: "EN",
          total_days: 2,
        },
      ],
      skip: 0,
      limit: 10,
      total: 1,
    });
  });

  it("does not crash when the selected template plan has no days", async () => {
    mockFetchPlanDetails.mockResolvedValue({
      id: "source-plan-id",
      title: "Source Plan",
      days: [],
    });

    renderDialog();

    fireEvent.click(screen.getByText("Add New Day"));
    fireEvent.focus(screen.getByPlaceholderText("Search plans…"));
    fireEvent.change(screen.getByPlaceholderText("Search plans…"), {
      target: { value: "Source" },
    });

    await waitFor(() => {
      expect(screen.getByText("Source Plan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Source Plan"));

    await waitFor(() => {
      expect(screen.getByText("No days in this plan")).toBeInTheDocument();
    });
  });

  it("shows a day picker when the template plan has days", async () => {
    mockFetchPlanDetails.mockResolvedValue({
      id: "source-plan-id",
      title: "Source Plan",
      days: [{ id: "source-day-id", day_number: 1, tasks: [] }],
    });

    renderDialog();

    fireEvent.click(screen.getByText("Add New Day"));
    fireEvent.focus(screen.getByPlaceholderText("Search plans…"));
    fireEvent.change(screen.getByPlaceholderText("Search plans…"), {
      target: { value: "Source" },
    });

    await waitFor(() => {
      expect(screen.getByText("Source Plan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Source Plan"));

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Select a day…")).toBeInTheDocument();
    });
  });
});
