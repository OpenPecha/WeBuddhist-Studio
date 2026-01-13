import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TaskForm from "./components/view/TaskForm";
import SideBar from "./components/sidebar-component/SideBar";
import TaskView from "./components/view/TaskView";
import { fetchPlanDetails } from "./api/planApi";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { plan_id } = useParams<{ plan_id: string }>();

  const { data: planDetails } = useQuery({
    queryKey: ["planDetails", plan_id],
    queryFn: () => fetchPlanDetails(plan_id!),
    enabled: !!plan_id,
  });

  const status = planDetails?.status || "DRAFT";
  const isDraft = status === "DRAFT";

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setSelectedTaskId(null);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    if (!isDraft) {
      return;
    }
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
        onTaskDelete={handleTaskDelete}
        isDraft={isDraft}
      />
      <div className=" w-full pl-4 rounded-l-2xl overflow-y-auto">
        {selectedTaskId ? (
          <TaskView
            taskId={selectedTaskId}
            onEditTask={handleEditTask}
            isDraft={isDraft}
          />
        ) : (
          <TaskForm
            selectedDay={selectedDay}
            editingTask={editingTask}
            onCancel={handleCancelTaskForm}
            isDraft={isDraft}
          />
        )}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
