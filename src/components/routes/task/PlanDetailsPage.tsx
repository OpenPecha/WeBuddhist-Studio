import { useState } from "react";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import { DefaultDayView } from "./components/DefaultView";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onAddTaskClick={() => setShowTaskForm(true)}
        onEditTask={handleEditTask}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {showTaskForm ? (
          <TaskForm selectedDay={selectedDay} editingTask={editingTask} onCancel={handleCancelTaskForm} />
        ) : (
          <DefaultDayView selectedDay={selectedDay} />
        )}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
