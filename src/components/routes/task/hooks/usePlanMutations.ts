import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createNewDay, deleteDay, deleteTask } from "../api/planApi";

export const usePlanMutations = (plan_id: string | undefined) => {
  const queryClient = useQueryClient();

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
        description:
          error.response?.data?.detail?.message || "Something went wrong",
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
        description: error.response?.data?.detail || "Something went wrong",
      });
    },
  });

  const createNewDayMutation = useMutation({
    mutationFn: () => createNewDay(plan_id!),
    onError: (error: any) => {
      toast.error("Failed to create new day", {
        description: error.response?.data?.detail || "Something went wrong",
      });
    },
  });

  return {
    deleteTask: deleteTaskMutation,
    deleteDay: deleteDayMutation,
    createNewDay: createNewDayMutation,
  };
};
