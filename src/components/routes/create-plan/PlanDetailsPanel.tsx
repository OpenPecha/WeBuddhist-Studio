import { IoCalendarClearOutline } from "react-icons/io5";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { FiTrash } from "react-icons/fi";

interface PlanWithDays {
  id: string;
  title: string;
  description: string;
  days: {
    id: string;
    day_number: number;
    title: string;
    tasks: {
      id: string;
      title: string;
      description: string;
      content_type: "TEXT" | "AUDIO" | "VIDEO" | "IMAGE" | "SOURCE_REFERENCE";
      content: string;
      estimated_time: number;
    }[];
  }[];
}

const mockPlanData: PlanWithDays = {
  id: "6819c6f3bd6d4825cc05f6c8",
  title: "4-Day Practice Plan: Daily Motivation Boost",
  description:
    "Right Motivation: You will learn how to set a clear and positive intention for your spiritual journey, recognizing the rare opportunity of human life. You'll begin each day with the aspiration to live meaningfully, act compassionately, and use your life to benefit others.",
  days: [
    {
      id: "1",
      day_number: 1,
      title: "Day 1",
      tasks: [
        {
          id: "task-1-1",
          title: "Morning Intention Setting",
          description: "Set your daily motivation and spiritual intention",
          content_type: "TEXT",
          content: "Begin your practice with clear intention...",
          estimated_time: 15,
        },
        {
          id: "task-1-2",
          title: "Compassion Reflection",
          description: "Reflect on ways to benefit others today",
          content_type: "TEXT",
          content: "Consider how your actions can help others...",
          estimated_time: 10,
        },
      ],
    },
    {
      id: "2",
      day_number: 2,
      title: "Day 2",
      tasks: [
        {
          id: "task-2-1",
          title: "Meaningful Living Practice",
          description: "Focus on living with purpose and meaning",
          content_type: "TEXT",
          content: "Explore what meaningful living means to you...",
          estimated_time: 20,
        },
      ],
    },
    {
      id: "3",
      day_number: 3,
      title: "Day 3",
      tasks: [
        {
          id: "task-3-1",
          title: "Heart Transformation Exercise",
          description: "Practice changing your perspective and motivation",
          content_type: "AUDIO",
          content: "Guided meditation on inner transformation...",
          estimated_time: 25,
        },
      ],
    },
    {
      id: "4",
      day_number: 4,
      title: "Day 4",
      tasks: [
        {
          id: "task-4-1",
          title: "Integration and Commitment",
          description: "Solidify your practice and make commitments",
          content_type: "TEXT",
          content: "Reflect on your journey and set future intentions...",
          estimated_time: 30,
        },
      ],
    },
  ],
};

const PlanDetailsPanel = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [currentPlan, setCurrentPlan] = useState<PlanWithDays>(mockPlanData);
  const addNewDay = () => {
    const newDay = currentPlan.days.length + 1;
    setCurrentPlan((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id: `day-${newDay}`,
          day_number: newDay,
          title: `Day ${newDay}`,
          tasks: [],
        },
      ],
    }));
    setSelectedDay(newDay);
    setExpandedDay(newDay);
  };
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <div className="w-80 bg-white dark:bg-background border-r border-gray-200 dark:border-border h-full flex flex-col">
        <div className="p-4">
          <div className="text-[#A51C21] text-md font-semibold mb-1">
            Current Plan
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {currentPlan.title}
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <IoCalendarClearOutline className="w-5 h-5 text-foreground" />
            <span className="text-md font-semibold text-foreground">Days</span>
          </div>

          <div className="space-y-2">
            {currentPlan.days.map((day) => (
              <div key={day.id} className="group">
                <div
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-accent/50"
                  onClick={() => {
                    setSelectedDay(day.day_number);
                    setExpandedDay(day.day_number);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full ${
                        selectedDay === day.day_number
                          ? "bg-[#4CAF50]"
                          : "bg-gray-200 dark:bg-input"
                      }`}
                    ></div>
                    <span
                      className={`text-md font-medium ${
                        selectedDay === day.day_number
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      Day {day.day_number}
                    </span>
                  </div>

                  {selectedDay === day.day_number && (
                    <div className="flex items-center gap-2">
                      <IoMdAdd className="w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer" />
                      <MdExpandMore
                        className={`w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer transition-transform ${
                          expandedDay === day.day_number ? "rotate-180" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDay(
                            expandedDay === day.day_number ? 0 : day.day_number,
                          );
                        }}
                      />
                    </div>
                  )}
                </div>

                {expandedDay === day.day_number && day.tasks.length > 0 && (
                  <div className="ml-9 mt-2 space-y-1">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-2 px-3 text-sm text-foreground bg-gray-50 dark:bg-accent/30 rounded"
                      >
                        <span>{task.title}</span>
                        <FiTrash className="w-3 h-3 text-gray-400 dark:text-muted-foreground cursor-pointer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={addNewDay}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors"
            >
              <IoMdAdd className="w-4 h-4 text-foreground" />
              <span className="text-md font-medium text-foreground">
                Add New Day
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-background p-8"></div>
    </div>
  );
};

export default PlanDetailsPanel;
