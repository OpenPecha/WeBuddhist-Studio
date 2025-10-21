import outlinepecha from "@/assets/icon/outlinepecha.svg";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const DefaultDayView = ({ selectedDay }: { selectedDay: number }) => {
  const queryClient = useQueryClient();
  const { plan_id } = useParams<{ plan_id: string }>();
  const currentPlan = queryClient.getQueryData<any>(["planDetails", plan_id]);
  const hasTasks = currentPlan?.days?.some(
    (d: any) => d.day_number === selectedDay && d.tasks?.length > 0,
  );
  return (
    <div className=" w-full h-full flex  space-y-2 flex-col items-center justify-center border">
      <div className=" opacity-20 dark:opacity-100">
        <img src={outlinepecha} alt="pecha outline" height={100} width={100} />
      </div>
      <div className="text-center">
        {hasTasks ? (
          <>
            <p className="text-lg ">Select a task to view details</p>
            <p className="text-sm text-gray-500">
              Click on a task in the sidebar to view details
            </p>
          </>
        ) : (
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
