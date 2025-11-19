import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import TaskForm from "./components/view/TaskForm";
import SideBar from "./components/sidebar-component/SideBar";
import TaskView from "./components/view/TaskView";

const PlanDetailsPage = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { plan_id } = useParams<{ plan_id: string }>();

  const queryClient = useQueryClient();

  const dashboardQueries = queryClient.getQueriesData<any>({
    queryKey: ["dashboard-plans"],
  });

  let cachedStatus: string | undefined;
  for (const [, queryData] of dashboardQueries) {
    if (queryData?.plans) {
      const cachedPlan = queryData.plans.find(
        (plan: any) => plan.id === plan_id,
      );
      if (cachedPlan?.status) {
        cachedStatus = cachedPlan.status;
        break;
      }
    }
  }

  const status = cachedStatus;
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
