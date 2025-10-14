import { IoCalendarClearOutline } from "react-icons/io5";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import TaskForm from "./components/TaskForm";
import TaskDeleteDialog from "@/components/ui/molecules/modals/task-delete/TaskDeleteDialog";
import outlinepecha from "@/assets/icon/outlinepecha.svg";

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

const DefaultDayView = ({ selectedDay }: { selectedDay: number }) => {
  return (
    <div className=" w-full h-full flex  space-y-2 flex-col items-center justify-center border">
      <div className=" opacity-20 dark:opacity-100">
        <img src={outlinepecha} alt="pecha outline" height={100} width={100} />
      </div>
      <div className="text-center">
        <p className="text-lg ">No tasks created for Day {selectedDay}</p>
        <p className="text-sm text-gray-500">
          Click the + icon next to the day to add your first task
        </p>
      </div>
    </div>
  );
};

const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(
    `${BACKEND_BASE_URL}/api/v1/cms/plans/${plan_id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    },
  );
  return data;
};

const createNewDay = async (plan_id: string) => {
  const { data } = await axiosInstance.post(
    `${BACKEND_BASE_URL}/api/v1/cms/plans/${plan_id}/days`,
    {},
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    },
  );
  return data;
};

const deleteTask = async (task_id: string) => {
  const { data } = await axiosInstance.delete(
    `${BACKEND_BASE_URL}/api/v1/cms/plan/tasks/${task_id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    },
  );
  return data;
};

const PlanDetailsPage = () => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const queryClient = useQueryClient();
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
  const deleteTaskMutation = useMutation({
    mutationFn: (task_id: string) => deleteTask(task_id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Failed to delete task", {
        description: error.response.data.detail,
      });
    },
  });
  const handleDeleteTask = (task_id: string) => {
    deleteTaskMutation.mutate(task_id);
  };
  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };
  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };
  const createNewDayMutation = useMutation({
    mutationFn: () => createNewDay(plan_id!),
    onSuccess: (newDay) => {
      setSelectedDay(newDay.day_number);
      setExpandedDay(newDay.day_number);
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to create new day", {
        description: error.response.data.detail,
      });
    },
  });
  const addNewDay = () => {
    if (!currentPlan || !plan_id) return;
    createNewDayMutation.mutate();
  };
  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setExpandedDay(dayNumber);
    setShowTaskForm(false);
    setEditingTask(null);
  };
  const currentDayData = currentPlan?.days?.find(
    (day: any) => day.day_number === selectedDay,
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-80 bg-[#FAFAFA] dark:bg-[#171414] border-r border-t border-gray-200 dark:border-border h-full flex flex-col">
        <div className="p-4">
          <div className="text-[#A51C21] text-md font-bold">Current Plan</div>
          <div className="text-sm text-black dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
            {currentPlan?.title}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex p-4 items-center border-b pb-3 gap-2 mb-1">
            <IoCalendarClearOutline className="w-5 h-5 text-foreground" />
            <span className="text-sm  text-foreground">Days</span>
          </div>

          <div className="space-y-1">
            {currentPlan?.days.map((day) => (
              <div key={day.id} className="group space-y-2">
                <div
                  className="flex items-center justify-between px-4 py-2 border-b cursor-pointer transition-colors hover:bg-[#f6f6f6] dark:hover:bg-[#000000]/10"
                  onClick={() => {
                    handleDayClick(day.day_number);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedDay === day.day_number
                          ? "bg-[#ba0909]"
                          : "bg-input"
                      }`}
                    ></div>
                    <span
                      className={`text-sm ${
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
                        data-testid="add-task-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(null);
                          setShowTaskForm(true);
                        }}
                      />
                      {day.tasks.length > 0 && (
                        <MdExpandMore
                          className={`w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer transition-transform ${
                            expandedDay === day.day_number ? "rotate-180" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDay(
                              expandedDay === day.day_number
                                ? 0
                                : day.day_number
                            );
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {expandedDay === day.day_number && day.tasks.length > 0 && (
                  <div className=" mx-2 border h-44 overflow-y-auto dark:bg-accent/30 bg-gray-100">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center border-b border-gray-200 dark:border-input/40 justify-between py-2 px-3 text-sm text-foreground"
                      >
                        <span>{task.title}</span>
                        <Pecha.DropdownMenu>
                          <Pecha.DropdownMenuTrigger asChild>
                            <BsThreeDots className="w-3 h-3 text-gray-400 dark:text-muted-foreground cursor-pointer" />
                          </Pecha.DropdownMenuTrigger>
                          <Pecha.DropdownMenuContent side="right">
                            <Pecha.DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => handleEditTask(task)}
                            >
                              <FaPen className="h-4 w-4" />
                              Edit
                            </Pecha.DropdownMenuItem>
                            <Pecha.DropdownMenuItem className="gap-2 cursor-pointer">
                              <TaskDeleteDialog
                                taskId={task.id}
                                onDelete={handleDeleteTask}
                              />
                            </Pecha.DropdownMenuItem>
                          </Pecha.DropdownMenuContent>
                        </Pecha.DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) || []}
          </div>
          <div className="px-2">
            <Pecha.Button
              type="button"
              onClick={addNewDay}
              disabled={createNewDayMutation.isPending}
              variant="destructive"
              className="cursor-pointer mt-3 rounded-none disabled:opacity-50 w-full disabled:cursor-not-allowed"
            >
              <IoMdAdd className="w-4 h-4" />
              <span className="text-sm font-medium">
                {createNewDayMutation.isPending ? "Adding..." : "Add New Day"}
              </span>
            </Pecha.Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {showTaskForm ? (
          <TaskForm
            selectedDay={selectedDay}
            editingTask={editingTask}
            onCancel={handleCancelTaskForm}
          />
        ) : currentDayData?.tasks?.length === 0 ? (
          <DefaultDayView selectedDay={selectedDay} />
        ) : null}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
