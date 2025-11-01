import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { reorderSubtasks } from "../api/taskApi";
import { reorderArray } from "@/lib/utils";

interface Subtask {
  id: string;
  display_order: number;
  [key: string]: any;
}

interface TaskDetails {
  subtasks: Subtask[];
  [key: string]: any;
}

export const useSubtaskReorder = (
  taskDetails: TaskDetails | undefined,
  task_id: string | undefined,
) => {
  const [optimisticSubtasks, setOptimisticSubtasks] = useState<Subtask[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (taskDetails?.subtasks) {
      const sortedSubtasks = [...taskDetails.subtasks].sort(
        (a, b) => a.display_order - b.display_order,
      );
      setOptimisticSubtasks(sortedSubtasks);
    }
  }, [taskDetails]);

  const reorderMutation = useMutation({
    mutationFn: ({
      taskId,
      subtasks,
    }: {
      taskId: string;
      subtasks: Array<{ sub_task_id: string; display_order: number }>;
    }) => reorderSubtasks(taskId, subtasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetails", task_id] });
    },
    onError: () => {
      if (taskDetails?.subtasks) {
        const originalSubtasks = [...taskDetails.subtasks].sort(
          (a, b) => a.display_order - b.display_order,
        );
        setOptimisticSubtasks(originalSubtasks);
      }
      toast.error("Failed to reorder subtasks", {
        description: "Something went wrong",
      });
      queryClient.refetchQueries({ queryKey: ["taskDetails", task_id] });
    },
  });

  const handleSubtaskReorder = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ) => {
    const activeSubtaskId = String(activeId);
    const overSubtaskId = String(overId);

    if (activeSubtaskId === overSubtaskId) return;

    const currentSubtasks =
      optimisticSubtasks.length > 0
        ? optimisticSubtasks
        : [...(taskDetails?.subtasks || [])].sort(
            (a, b) => a.display_order - b.display_order,
          );

    const newSubtasks = reorderArray(
      currentSubtasks,
      activeSubtaskId,
      overSubtaskId,
    );

    if (!newSubtasks) return;

    setOptimisticSubtasks(newSubtasks);

    const subtasksPayload = newSubtasks.map((subtask) => ({
      sub_task_id: subtask.id,
      display_order: subtask.display_order,
    }));

    if (task_id) {
      reorderMutation.mutate({
        taskId: task_id,
        subtasks: subtasksPayload,
      });
    }
  };

  const getDisplaySubtasks = (): Subtask[] => {
    if (optimisticSubtasks.length > 0) {
      return optimisticSubtasks;
    }
    return [...(taskDetails?.subtasks || [])].sort(
      (a, b) => a.display_order - b.display_order,
    );
  };

  return {
    handleSubtaskReorder,
    getDisplaySubtasks,
  };
};
