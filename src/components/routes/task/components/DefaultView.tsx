import outlinepecha from "@/assets/icon/outlinepecha.svg";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import axiosInstance from "@/config/axios-config";

interface DefaultDayViewProps {
  selectedDay: number;
  onFirstTaskSelect?: (taskId: string) => void;
}

const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });
  return data;
};

export const DefaultDayView = ({ selectedDay, onFirstTaskSelect }: DefaultDayViewProps) => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const { data: currentPlan } = useQuery({
    queryKey: ["planDetails", plan_id],
    queryFn: () => fetchPlanDetails(plan_id!),
    enabled: !!plan_id,
    refetchOnWindowFocus: false,
  });
  
  const selectedDayData = currentPlan?.days?.find(
    (d: any) => d.day_number === selectedDay
  );
  
  const hasTasks = selectedDayData?.tasks?.length > 0;
  const firstTask = hasTasks ? selectedDayData.tasks[0] : null;
  useEffect(() => {
    if (currentPlan && hasTasks && firstTask && onFirstTaskSelect) {
      onFirstTaskSelect(firstTask.id);
    }
  }, [currentPlan, selectedDay, hasTasks, firstTask, onFirstTaskSelect]);

  return (
    <div className=" w-full h-full flex  space-y-2 flex-col items-center justify-center border">
      <div className=" opacity-20 dark:opacity-100">
        <img src={outlinepecha} alt="pecha outline" height={100} width={100} />
      </div>
      <div className="text-center">
        {!hasTasks && (
          <>
            <p className="text-lg ">No tasks created for Day {selectedDay}</p>
            <p className="text-sm text-gray-500">
              Click the + icon next to the day to add your first task
            </p>
          </>
        )}
      </div>
    </div>
  );
};
