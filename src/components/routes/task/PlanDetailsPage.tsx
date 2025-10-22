import { useState } from "react";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import TaskView from "./components/TaskView";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setSelectedTaskId(null);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setSelectedTaskId(null);
  };

  const handleCancelTaskForm = (newlyCreatedTaskId?: string) => {
    setEditingTask(null);
    if (newlyCreatedTaskId) {
      setSelectedTaskId(newlyCreatedTaskId);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onAddTaskClick={() => {
          setSelectedTaskId(null);
        }}
        onTaskClick={(taskId) => {
          setSelectedTaskId(taskId);
        }}
        onEditTask={handleEditTask}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {selectedTaskId ? (
          <TaskView taskId={selectedTaskId} />
        ) : (
          <TaskForm
            selectedDay={selectedDay}
            editingTask={editingTask}
            onCancel={handleCancelTaskForm}
          />
        )}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
