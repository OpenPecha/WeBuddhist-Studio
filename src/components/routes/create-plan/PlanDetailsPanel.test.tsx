import { fireEvent, render, screen } from "@testing-library/react";
import PlanDetailsPanel from "./PlanDetailsPanel";

const mockPlanData = {
  title: "4-Day Practice Plan: Daily Motivation Boost",
  days: {
    day1: {
      label: "Day 1",
      tasks: ["Morning Intention Setting", "Compassion Reflection"],
    },
    day2: { label: "Day 2", tasks: ["Meaningful Living Practice"] },
    day3: { label: "Day 3", tasks: ["Heart Transformation Exercise"] },
    day4: { label: "Day 4", tasks: ["Integration and Commitment"] },
  },
};

describe("PlanDetailsPanel Component", () => {
  it("renders plan details panel with current plan title and days", () => {
    render(<PlanDetailsPanel />);

    expect(screen.getByText("Current Plan")).toBeInTheDocument();
    expect(screen.getByText(mockPlanData.title)).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();
    expect(screen.getByText(mockPlanData.days.day1.label)).toBeInTheDocument();
    expect(screen.getByText(mockPlanData.days.day2.label)).toBeInTheDocument();
    expect(screen.getByText(mockPlanData.days.day3.label)).toBeInTheDocument();
    expect(screen.getByText(mockPlanData.days.day4.label)).toBeInTheDocument();
  });

  it("shows tasks when a day is selected and expanded", () => {
    render(<PlanDetailsPanel />);
    expect(
      screen.getByText(mockPlanData.days.day1.tasks[0]),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockPlanData.days.day1.tasks[1]),
    ).toBeInTheDocument();
    const day2 = screen.getByText(mockPlanData.days.day2.label);
    fireEvent.click(day2);
    expect(
      screen.getByText(mockPlanData.days.day2.tasks[0]),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(mockPlanData.days.day1.tasks[0]),
    ).not.toBeInTheDocument();
  });

  it("adds new day when Add New Day button is clicked", () => {
    render(<PlanDetailsPanel />);
    expect(screen.getByText(mockPlanData.days.day4.label)).toBeInTheDocument();
    expect(screen.queryByText("Day 5")).not.toBeInTheDocument();
    const addDayButton = screen.getByText("Add New Day");
    fireEvent.click(addDayButton);
    expect(screen.getByText("Day 5")).toBeInTheDocument();
  });
});
