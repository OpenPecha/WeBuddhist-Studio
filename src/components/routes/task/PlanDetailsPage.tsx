import { useState } from "react";
import axiosInstance from "@/config/axios-config";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import { DefaultDayView } from "./components/DefaultView";

interface SubTask {
  id: string;
  content: string;
  content_type: "TEXT" | "AUDIO" | "VIDEO" | "IMAGE";
  display_order: number;
}

interface PlanWithDays {
  id: string;
  title: string;
  description: string;
  days: {
    id: string;
    day_number: number;
    tasks: {
      id: string;
      title: string;
      estimated_time: number;
      display_order: number;
      subtasks: SubTask[];
    }[];
  }[];
}
const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });
  return data;
};

const PlanDetailsPage = () => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);

  const {
    data: currentPlan,
    isLoading: _isLoading,
    error: _error,
  } = useQuery<PlanWithDays>({
    queryKey: ["planDetails", plan_id],
    queryFn: () => fetchPlanDetails(plan_id!),
    enabled: !!plan_id,
    refetchOnWindowFocus: false,
  });

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowTaskForm(false);
  };
  const currentDayData = currentPlan?.days?.find(
    (day: any) => day.day_number === selectedDay,
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        currentPlan={currentPlan}
        planId={plan_id!}
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onAddTaskClick={() => setShowTaskForm(true)}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {showTaskForm ? (
          <TaskForm selectedDay={selectedDay} />
        ) : currentDayData?.tasks?.length === 0 ? (
          <DefaultDayView selectedDay={selectedDay} />
        ) : null}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
