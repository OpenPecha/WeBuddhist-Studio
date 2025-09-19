import { IoCalendarClearOutline } from "react-icons/io5";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import TaskForm from "./TaskForm";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

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
      description: string;
      content_type: "TEXT" | "AUDIO" | "VIDEO" | "IMAGE" | "SOURCE_REFERENCE";
      content: string;
      estimated_time: number;
    }[];
  }[];
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
});

const fetchPlanDetails = async (planId: string) => {
  const { data } = await axiosInstance.get(
    `${BACKEND_BASE_URL}/api/v1/cms/plans/${planId}`,
    { headers: getAuthHeaders() }
  );
  return data;
};

const createNewDay = async (planId: string) => {
  const { data } = await axiosInstance.post(
    `${BACKEND_BASE_URL}/api/v1/cms/plans/${planId}/days`,
    {},
    { headers: getAuthHeaders() }
  );
  return data;
};

const PlanDetailsPanel = () => {
  const { planId } = useParams<{ planId: string }>();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const {
    data: currentPlan,
    isLoading,
    error,
  } = useQuery<PlanWithDays>({
    queryKey: ["planDetails", planId],
    queryFn: () => fetchPlanDetails(planId!),
    enabled: !!planId,
    refetchOnWindowFocus: false,
  });

  const createNewDayMutation = useMutation({
    mutationFn: () => createNewDay(planId!),
    onSuccess: (newDay) => {
      setSelectedDay(newDay.day_number);
      setExpandedDay(newDay.day_number);
      queryClient.refetchQueries({ queryKey: ["planDetails", planId] });
    },
    onError: (error) => {
      toast.error("Failed to create new day", {
        description: error.message,
      });
    },
  });
  const addNewDay = () => {
    if (!currentPlan || !planId) return;
    createNewDayMutation.mutate();
  };
  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setExpandedDay(dayNumber);
    setShowTaskForm(false);
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <div className="w-80 bg-white dark:bg-background border-r border-gray-200 dark:border-border h-full flex flex-col">
        <div className="p-4">
          <div className="text-[#A51C21] text-md font-semibold mb-1">
            Current Plan
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {currentPlan?.title}
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <IoCalendarClearOutline className="w-5 h-5 text-foreground" />
            <span className="text-md font-semibold text-foreground">Days</span>
          </div>

          <div className="space-y-2">
            {currentPlan?.days.map((day) => (
              <div key={day.id} className="group">
                <div
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-accent/50"
                  onClick={() => {
                    handleDayClick(day.day_number);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full ${
                        selectedDay === day.day_number
                          ? "bg-[#4CAF50]"
                          : "bg-input"
                      }`}
                    ></div>
                    <span
                      className={`text-md font-medium ${
                        selectedDay === day.day_number
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      Day {day.day_number}
                    </span>
                  </div>

                  {selectedDay === day.day_number && (
                    <div className="flex items-center gap-2">
                      <IoMdAdd
                        className="w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTaskForm(true);
                        }}
                      />
                      <MdExpandMore
                        className={`w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer transition-transform ${
                          expandedDay === day.day_number ? "rotate-180" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDay(
                            expandedDay === day.day_number ? 0 : day.day_number,
                          );
                        }}
                      />
                    </div>
                  )}
                </div>

                {expandedDay === day.day_number && day.tasks.length > 0 && (
                  <div className="ml-9 mt-2 space-y-1">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-2 px-3 text-sm text-foreground bg-gray-50 dark:bg-accent/30 rounded"
                      >
                        <span>{task.title}</span>
                        <FiTrash className="w-3 h-3 text-gray-400 dark:text-muted-foreground cursor-pointer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) || []}
          </div>

          <div className="mt-4">
            <button
              onClick={addNewDay}
              disabled={createNewDayMutation.isPending}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoMdAdd className="w-4 h-4 text-foreground" />
              <span className="text-md font-medium text-foreground">
                {createNewDayMutation.isPending ? "Adding..." : "Add New Day"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-background p-8">
        {showTaskForm && <TaskForm selectedDay={selectedDay} />}
      </div>
    </div>
  );
};

export default PlanDetailsPanel;
