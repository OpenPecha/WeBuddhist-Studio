import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createNewDays,
  deleteDays,
  deleteTask,
  type CreateDaysRequest,
} from "../api/planApi";
import { getApiErrorMessage } from "@/lib/apiErrors";

export const PLAN_DAYS_OVERLAP_NEXT_PLAN_CODE = "PLAN_DAYS_OVERLAP_NEXT_PLAN";

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

  const deleteDaysMutation = useMutation({
    mutationFn: (day_ids: string[]) => deleteDays(plan_id!, day_ids),
    onSuccess: (_data, day_ids) => {
      const count = day_ids.length;
      toast.success(
        count === 1 ? "Day deleted successfully!" : `${count} days deleted.`,
        { description: "Remaining days have been renumbered." },
      );
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete day(s)", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const createNewDaysMutation = useMutation({
    mutationFn: (body?: CreateDaysRequest) => createNewDays(plan_id!, body),
    onError: (error: any) => {
      // The overlap case is handled by the caller, which offers to shift the
      // rest of the series forward instead of showing a dead-end error.
      if (
        error?.response?.data?.detail?.code === PLAN_DAYS_OVERLAP_NEXT_PLAN_CODE
      ) {
        return;
      }
      toast.error("Failed to create days", {
        description: getApiErrorMessage(error),
      });
    },
  });

  return {
    deleteTask: deleteTaskMutation,
    deleteDay: deleteDaysMutation,
    createNewDay: createNewDaysMutation,
  };
};
