import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { reorderTasks } from "../api/taskApi";

interface Task {
  id: string;
  display_order: number;
  [key: string]: any;
}

interface Day {
  id: string;
  tasks: Task[];
  [key: string]: any;
}

interface Plan {
  days: Day[];
  [key: string]: any;
}

export const useTaskReorder = (
  currentPlan: Plan | undefined,
  plan_id: string | undefined,
) => {
  const [optimisticTasks, setOptimisticTasks] = useState<{
    [dayId: string]: Task[];
  }>({});
  const queryClient = useQueryClient();

  // Initialize optimistic tasks when plan loads
  useEffect(() => {
    if (currentPlan?.days) {
      const initialTasks: { [dayId: string]: Task[] } = {};
      currentPlan.days.forEach((day: Day) => {
        initialTasks[day.id] = [...day.tasks].sort(
          (a, b) => a.display_order - b.display_order,
        );
      });
      setOptimisticTasks(initialTasks);
    }
  }, [currentPlan]);

  const reorderMutation = useMutation({
    mutationFn: ({
      activeTaskId,
      targetOrder,
    }: {
      activeTaskId: string;
      targetOrder: number;
    }) => reorderTasks(activeTaskId, targetOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: () => {
      toast.error("Failed to reorder tasks", {
        description: "Something went wrong",
      });
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
  });

  //logic is ai generated so might be messy to review
  const handleTaskReorder = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ) => {
    const activeTaskId = String(activeId);
    const overTaskId = String(overId);

    if (activeTaskId === overTaskId) return;

    const dayContainingActiveTask = currentPlan?.days.find((day: Day) =>
      day.tasks.some((task: Task) => task.id === activeTaskId),
    );

    if (!dayContainingActiveTask) return;

    const dayId = dayContainingActiveTask.id;
    const currentTasks =
      optimisticTasks[dayId] ||
      [...dayContainingActiveTask.tasks].sort(
        (a, b) => a.display_order - b.display_order,
      );

    const activeTaskIndex = currentTasks.findIndex(
      (task) => task.id === activeTaskId,
    );
    const overTaskIndex = currentTasks.findIndex(
      (task) => task.id === overTaskId,
    );

    if (activeTaskIndex === -1 || overTaskIndex === -1) return;

    const targetDisplayOrder = currentTasks[overTaskIndex].display_order;

    // Optimistically update UI
    const newTasks = [...currentTasks];
    const [movedTask] = newTasks.splice(activeTaskIndex, 1);
    newTasks.splice(overTaskIndex, 0, movedTask);

    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      display_order: index,
    }));

    setOptimisticTasks((prev) => ({
      ...prev,
      [dayId]: updatedTasks,
    }));

    // Persist to backend
    reorderMutation.mutate({
      activeTaskId,
      targetOrder: targetDisplayOrder,
    });
  };

  const getDisplayTasks = (day: Day): Task[] => {
    if (optimisticTasks[day.id]) {
      return optimisticTasks[day.id];
    }
    return [...day.tasks].sort((a, b) => a.display_order - b.display_order);
  };

  return {
    handleTaskReorder,
    getDisplayTasks,
  };
};
