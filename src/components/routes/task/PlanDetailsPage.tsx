import { useState } from "react";
import TaskForm from "./components/view/TaskForm";
import SideBar from "./components/sidebar-component/SideBar";
import TaskView from "./components/view/TaskView";

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

  const handleTaskDelete = (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onTaskClick={(taskId) => {
          setSelectedTaskId(taskId);
        }}
        onEditTask={handleEditTask}
        onTaskDelete={handleTaskDelete}
      />
      <div className=" w-full pl-4 rounded-l-2xl overflow-y-auto">
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
