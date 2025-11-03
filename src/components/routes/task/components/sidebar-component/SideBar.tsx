import { useState, Activity } from "react";
import { IoCalendarClearOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { MdExpandMore } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import { Pecha } from "@/components/ui/shadimport";
import TaskDeleteDialog from "@/components/ui/molecules/modals/task-delete/TaskDeleteDialog";
import DayDeleteDialog from "@/components/ui/molecules/modals/day-delete/DayDeleteDialog";
import { useParams } from "react-router-dom";
import { SortableList, SortableItem } from "@/components/ui/atoms/sortable";
import { PiDotsSixVertical } from "react-icons/pi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlanDetails } from "../../api/planApi";
import { usePlanMutations } from "../../hooks/usePlanMutations";
import { useTaskReorder } from "../../hooks/useTaskReorder";
import { useDayReorder } from "../../hooks/useDayReorder";
interface SideBarProps {
  selectedDay: number;
  onDaySelect: (dayNumber: number) => void;
  onTaskClick?: (taskId: string) => void;
  onEditTask: (task: any) => void;
  onTaskDelete?: (taskId: string) => void;
}

const SideBar = ({
  selectedDay,
  onDaySelect,
  onTaskClick,
  onEditTask,
  onTaskDelete,
}: SideBarProps) => {
  const [expandedDay, setExpandedDay] = useState<number>(selectedDay);
  const { plan_id } = useParams<{ plan_id: string }>();
  const queryClient = useQueryClient();
  const { data: currentPlan, isLoading } = useQuery({
    queryKey: ["planDetails", plan_id],
    queryFn: () => fetchPlanDetails(plan_id!),
    enabled: !!plan_id,
    refetchOnWindowFocus: false,
  });
  const { deleteTask, deleteDay, createNewDay } = usePlanMutations(plan_id);
  const { handleTaskReorder, getDisplayTasks } = useTaskReorder(
    currentPlan,
    plan_id,
  );
  const { handleDayReorder, getDisplayDays } = useDayReorder(
    currentPlan,
    plan_id,
  );

  const displayDays = getDisplayDays();

  const handleDayClick = (dayNumber: number) => {
    onDaySelect(dayNumber);
    setExpandedDay(dayNumber);
  };

  const handleDeleteTask = (task_id: string) => {
    deleteTask.mutate(task_id, {
      onSuccess: () => {
        onTaskDelete?.(task_id);
      },
    });
  };

  const handleDeleteDay = (day_id: string) => {
    deleteDay.mutate(day_id);
  };

  const addNewDay = () => {
    if (!currentPlan || !plan_id) return;
    createNewDay.mutate(undefined, {
      onSuccess: (newDay) => {
        onDaySelect(newDay.day_number);
        setExpandedDay(newDay.day_number);
        queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
      },
    });
  };
  return (
    <div className=" w-96 dark:bg-[#161616] border-gray-200 dark:border-border h-screen flex flex-col">
      <div className="p-4">
        <div className="dark:text-[#bebebe] text-[#4d4d4d] text-md font-bold">
          Current Plan
        </div>
        <div className="text-sm w-80 text-black dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
          {isLoading ? (
            <Pecha.Skeleton className="h-6 w-full rounded" />
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

        <div className="space-y-1 h-[calc(100vh-200px)] overflow-auto">
          {isLoading ? (
            <>
              {[1, 2, 3].map((index) => (
                <div key={index} className="px-4 py-2 border-b">
                  <Pecha.Skeleton className="h-8 w-full rounded" />
                </div>
              ))}
            </>
          ) : (
            <SortableList
              items={displayDays.map((day: any) => ({
                id: day.id,
                day_number: day.day_number,
              }))}
              onReorder={(activeId: any, overId: any) => {
                handleDayReorder(activeId, overId);
              }}
            >
              {displayDays.map((day: any) => (
                <SortableItem key={day.id} id={day.id}>
                  {({ listeners }: any) => (
                    <div className="group space-y-2">
                      <div
                        className="flex items-center justify-between px-4 py-2 border-b  border-dashed cursor-pointer transition-colors hover:bg-[#f6f6f6] dark:hover:bg-[#000000]/10"
                        onClick={() => {
                          handleDayClick(day.day_number);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <PiDotsSixVertical
                            className="w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-grab active:cursor-grabbing"
                            {...listeners}
                            onClick={(e) => e.stopPropagation()}
                          />
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
                          mode={
                            selectedDay === day.day_number
                              ? "visible"
                              : "hidden"
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Activity
                              mode={day.tasks.length > 0 ? "visible" : "hidden"}
                            >
                              <MdExpandMore
                                className={`w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer transition-transform ${
                                  expandedDay === day.day_number
                                    ? "rotate-180"
                                    : ""
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
                            <IoMdAdd
                              className="w-4 h-4 text-gray-400 dark:text-muted-foreground cursor-pointer"
                              onClick={() => {
                                handleDayClick(day.day_number);
                              }}
                            />
                            {currentPlan?.days.length > 1 && (
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
                            )}
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
                        <div className=" mx-2 border h-44 overflow-y-auto dark:bg-accent/30 bg-[#F5F5F5]">
                          <SortableList
                            items={getDisplayTasks(day).map((task: any) => ({
                              id: task.id,
                              display_order: task.display_order,
                            }))}
                            onReorder={(activeId: any, overId: any) => {
                              handleTaskReorder(activeId, overId);
                            }}
                          >
                            {getDisplayTasks(day).map((task: any) => (
                              <SortableItem
                                key={task.id}
                                id={task.id}
                                className="flex items-center gap-x-2 bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-input/40 justify-between py-2 pr-3 pl-1 text-sm text-foreground"
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
                  )}
                </SortableItem>
              ))}
            </SortableList>
          )}
        </div>
        <div className="px-2">
          <Pecha.Button
            type="button"
            onClick={addNewDay}
            disabled={createNewDay.isPending}
            variant="destructive"
            className="cursor-pointer mt-1 disabled:opacity-50 w-full disabled:cursor-not-allowed"
          >
            <IoMdAdd className="w-4 h-4" />
            <span className="text-sm font-medium">
              {createNewDay.isPending ? "Adding..." : "Add New Day"}
            </span>
          </Pecha.Button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
