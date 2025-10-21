import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DayDeleteDialog from "./DayDeleteDialog";

vi.mock("react-icons/fi", () => ({
  FiTrash: () => <div data-testid="trash-icon">Trash Icon</div>,
}));

describe("DayDeleteDialog Component", () => {
  const mockOnDelete = vi.fn();
  const mockDayId = "test-day-id-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the delete trigger button with trash icon and text", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("opens the alert dialog when delete trigger is clicked", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This action cannot be undone. This will permanently delete this day and its tasks.",
      ),
    ).toBeInTheDocument();
  });

  it("displays the correct dialog title and description", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This action cannot be undone. This will permanently delete this day and its tasks.",
      ),
    ).toBeInTheDocument();
  });

  it("displays Cancel and Delete Day buttons in the dialog", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete Day")).toBeInTheDocument();
  });

  it("closes the dialog when Cancel button is clicked", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("calls onDelete with correct dayId when Delete Day button is clicked", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    const deleteDayButton = screen.getByText("Delete Day");
    fireEvent.click(deleteDayButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockDayId);
  });

  it("closes the dialog after Delete Day button is clicked", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    const deleteDayButton = screen.getByText("Delete Day");
    fireEvent.click(deleteDayButton);

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("stops event propagation when delete trigger is clicked", () => {
    const parentClickHandler = vi.fn();

    const { container } = render(
      <div onClick={parentClickHandler}>
        <DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />
      </div>,
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it("renders with correct CSS classes for Delete Day button", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    const deleteDayButton = screen.getByText("Delete Day");
    expect(deleteDayButton).toHaveClass(
      "bg-[#AD1B21]",
      "dark:text-white",
      "hover:bg-[#AD1B21]/90",
    );
  });

  it("does not call onDelete when dialog is opened and closed without confirmation", () => {
    render(<DayDeleteDialog dayId={mockDayId} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
