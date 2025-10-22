import { useState } from "react";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import { DefaultDayView } from "./components/DefaultView";
import TaskView from "./components/TaskView";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowTaskForm(false);
    setSelectedTaskId(null);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
    setSelectedTaskId(null);
  };

  const handleCancelTaskForm = (newlyCreatedTaskId?: string) => {
    setShowTaskForm(false);
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
          setShowTaskForm(true);
          setSelectedTaskId(null);
        }}
        onTaskClick={(taskId) => {
          setSelectedTaskId(taskId);
          setShowTaskForm(false);
        }}
        onEditTask={handleEditTask}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {selectedTaskId ? (
          <TaskView taskId={selectedTaskId} />
        ) : showTaskForm ? (
          <TaskForm
            selectedDay={selectedDay}
            editingTask={editingTask}
            onCancel={handleCancelTaskForm}
          />
        ) : (
          <DefaultDayView
            selectedDay={selectedDay}
            onFirstTaskSelect={(taskId) => setSelectedTaskId(taskId)}
          />
        )}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
