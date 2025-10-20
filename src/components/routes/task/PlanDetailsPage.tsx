import { useState } from "react";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import { DefaultDayView } from "./components/DefaultView";
import TaskView from "./components/TaskView";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowTaskForm(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onAddTaskClick={() => {
          setShowTaskForm(true);
          setSelectedTaskId(null);
        }}
        onTaskClick={(taskId) => {
          setSelectedTaskId(taskId);
          setShowTaskForm(false);
        }}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {selectedTaskId ? (
          <TaskView
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        ) : showTaskForm ? (
          <TaskForm selectedDay={selectedDay} />
        ) : (
          <DefaultDayView selectedDay={selectedDay} />
        )}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
