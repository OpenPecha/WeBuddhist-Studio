import { useState, Activity } from "react";
import { IoCalendarClearOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import TaskDeleteDialog from "@/components/ui/molecules/modals/task-delete/TaskDeleteDialog";
import DayDeleteDialog from "@/components/ui/molecules/modals/day-delete/DayDeleteDialog";
import axiosInstance from "@/config/axios-config";
import { useParams } from "react-router-dom";
import { SortableList, SortableItem } from "@/components/ui/atoms/sortable";
import { reorderTasks } from "../../api/taskApi";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { PiDotsSixVertical } from "react-icons/pi";
interface SideBarProps {
  selectedDay: number;
  onDaySelect: (dayNumber: number) => void;
  onTaskClick?: (taskId: string) => void;
  onEditTask: (task: any) => void;
}

const fetchPlanDetails = async (plan_id: string) => {
  const { data } = await axiosInstance.get(`/api/v1/cms/plans/${plan_id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });
  return data;
};

const createNewDay = async (plan_id: string) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/plans/${plan_id}/days`,
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
  const { data } = await axiosInstance.delete(`/api/v1/cms/tasks/${task_id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });
  return data;
};

const deleteDay = async (plan_id: string, day_id: string) => {
  const { data } = await axiosInstance.delete(
    `/api/v1/cms/plans/${plan_id}/days/${day_id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    },
  );
  return data;
};

const SideBar = ({
  selectedDay,
  onDaySelect,
  onTaskClick,
  onEditTask,
}: SideBarProps) => {
  const [expandedDay, setExpandedDay] = useState<number>(selectedDay);
  const queryClient = useQueryClient();
  const { plan_id } = useParams<{ plan_id: string }>();

  const {
    data: currentPlan,
    isLoading: _isLoading,
    error: _error,
  } = useQuery({
    queryKey: ["planDetails", plan_id],
    queryFn: () => fetchPlanDetails(plan_id!),
    enabled: !!plan_id,
    refetchOnWindowFocus: false,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (task_id: string) => deleteTask(task_id),
    onSuccess: () => {
      toast.success("Task deleted successfully!", {
        description: "The task has been deleted.",
      });
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete task", {
        description: error.response.data.detail.message,
      });
    },
  });

  const deleteDayMutation = useMutation({
    mutationFn: (day_id: string) => deleteDay(plan_id!, day_id),
    onSuccess: () => {
      toast.success("Day deleted successfully!", {
        description: "The day has been deleted.",
      });
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete day", {
        description: error.response.data.detail,
      });
    },
  });

  const createNewDayMutation = useMutation({
    mutationFn: () => createNewDay(plan_id!),
    onSuccess: (newDay) => {
      onDaySelect(newDay.day_number);
      setExpandedDay(newDay.day_number);
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to create new day", {
        description: error.response.data.detail,
      });
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: ({
      activeTaskId,
      targetTaskId,
    }: {
      activeTaskId: string;
      targetTaskId: string;
    }) => reorderTasks(activeTaskId, targetTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to reorder tasks", {
        description: error.response?.data?.detail || "Something went wrong",
      });
    },
  });

  const handleDayClick = (dayNumber: number) => {
    onDaySelect(dayNumber);
    setExpandedDay(dayNumber);
  };

  const handleDeleteTask = (task_id: string) => {
    deleteTaskMutation.mutate(task_id);
  };

  const handleDeleteDay = (day_id: string) => {
    deleteDayMutation.mutate(day_id);
  };

  const addNewDay = () => {
    if (!currentPlan || !plan_id) return;
    createNewDayMutation.mutate();
  };

  const handleTaskReorder = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ) => {
    const activeTaskId = String(activeId);
    const targetTaskId = String(overId);

    if (activeTaskId === targetTaskId) return;

    reorderTasksMutation.mutate({
      activeTaskId,
      targetTaskId,
    });
  };
  return (
    <div className="w-80 bg-[#FAFAFA] dark:bg-[#161616]  border-gray-200 dark:border-border h-screen flex flex-col">
      <div className="p-4">
        <div className="text-[#A51C21] text-md font-bold">Current Plan</div>
        <div className="text-sm text-black dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
          {_isLoading ? (
            <Pecha.Skeleton className="h-6 w-9/12 rounded" />
          ) : (
            currentPlan?.title
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex p-4 items-center border-b pb-3 gap-2 mb-1">
          <IoCalendarClearOutline className="w-5 h-5 text-foreground" />
          <span className="text-sm  text-foreground">Days</span>
        </div>

        <div className="space-y-1 h-[calc(100vh-300px)] overflow-auto">
          {_isLoading ? (
            <>
              {[1, 2, 3].map((index) => (
                <div key={index} className="px-4 py-2 border-b">
                  <Pecha.Skeleton className="h-8 w-full rounded" />
                </div>
              ))}
            </>
          ) : (
            currentPlan?.days.map((day: any) => (
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

                  <Activity
                    mode={selectedDay === day.day_number ? "visible" : "hidden"}
                  >
                    <div className="flex items-center gap-2">
                      <Activity
                        mode={day.tasks.length > 0 ? "visible" : "hidden"}
                      >
                        <MdExpandMore
                          className={`w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer transition-transform ${
                            expandedDay === day.day_number ? "rotate-180" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDay(
                              expandedDay === day.day_number
                                ? 0
                                : day.day_number,
                            );
                          }}
                        />
                      </Activity>

                      <Pecha.DropdownMenu>
                        <Pecha.DropdownMenuTrigger asChild>
                          <BsThreeDots className="w-3 h-3 text-gray-400 dark:text-muted-foreground cursor-pointer" />
                        </Pecha.DropdownMenuTrigger>
                        <Pecha.DropdownMenuContent side="right">
                          <Pecha.DropdownMenuItem className="gap-2 cursor-pointer">
                            <DayDeleteDialog
                              dayId={day.id}
                              onDelete={handleDeleteDay}
                            />
                          </Pecha.DropdownMenuItem>
                        </Pecha.DropdownMenuContent>
                      </Pecha.DropdownMenu>
                    </div>
                  </Activity>
                </div>

                <Activity
                  mode={
                    expandedDay === day.day_number && day.tasks.length > 0
                      ? "visible"
                      : "hidden"
                  }
                >
                  <div className=" mx-2 border h-44 overflow-y-auto dark:bg-accent/30 bg-gray-100">
                    <SortableList
                      items={day.tasks.map((task: any) => ({ id: task.id }))}
                      onReorder={(activeId: any, overId: any) =>
                        handleTaskReorder(activeId, overId)
                      }
                    >
                      {day.tasks.map((task: any) => (
                        <SortableItem
                          key={task.id}
                          id={task.id}
                          className="flex items-center gap-x-2 border-b border-gray-200 dark:border-input/40 justify-between py-2 pr-3 pl-1 text-sm text-foreground"
                        >
                          {({ listeners }: any) => (
                            <>
                              <PiDotsSixVertical
                                className="w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-grab active:cursor-grabbing"
                                {...listeners}
                              />
                              <span
                                className="cursor-pointer w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskClick?.(task.id);
                                }}
                              >
                                {task.title}
                              </span>
                              <Pecha.DropdownMenu>
                                <Pecha.DropdownMenuTrigger asChild>
                                  <BsThreeDots
                                    className="w-3 h-3 text-gray-400 dark:text-muted-foreground cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Pecha.DropdownMenuTrigger>
                                <Pecha.DropdownMenuContent side="right">
                                  <Pecha.DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={() => onEditTask(task)}
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
                            </>
                          )}
                        </SortableItem>
                      ))}
                    </SortableList>
                  </div>
                </Activity>
              </div>
            ))
          )}
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
  );
};

export default SideBar;
