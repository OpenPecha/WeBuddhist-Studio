import { useState, useEffect, Activity } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { taskSchema } from "@/schema/TaskSchema";
import { SubTaskCard } from "../ui/SubTaskCard";
import type { SubTask } from "../ui/SubTaskCard";
import { TaskTitleField } from "../ui/TaskTitleField";
import { ContentTypeSelector } from "../ui/ContentTypeSelector";
import {
  createTask,
  uploadImageToS3,
  createSubTasks,
  updateSubTasks,
  fetchTaskDetails,
} from "../../api/taskApi";

interface TaskFormProps {
  selectedDay: number;
  editingTask?: any;
  onCancel: (newlyCreatedTaskId?: string) => void;
}

type TaskFormData = z.infer<typeof taskSchema>;

const buildSubTaskPayload = (subTask: SubTask) => {
  switch (subTask.contentType) {
    case "VIDEO":
      return {
        content: subTask.videoUrl,
        content_type: "VIDEO",
      };
    case "TEXT":
      return {
        content: subTask.textContent,
        content_type: "TEXT",
      };
    case "AUDIO":
      return {
        content: subTask.musicUrl,
        content_type: "AUDIO",
      };
    case "IMAGE":
      return {
        content: subTask.imageKey,
        content_type: "IMAGE",
      };
  }
};

const TaskForm = ({ selectedDay, editingTask, onCancel }: TaskFormProps) => {
  const { plan_id } = useParams();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(taskSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
    },
  });
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const formValues = form.watch();
  const isEditMode = Boolean(editingTask);

  const currentPlan = queryClient.getQueryData<any>(["planDetails", plan_id]);
  const currentDayData = currentPlan?.days?.find(
    (day: any) => day.day_number === selectedDay,
  );

  const { data: taskDetails } = useQuery({
    queryKey: ["taskDetails", editingTask?.id],
    queryFn: () => fetchTaskDetails(editingTask.id),
    enabled: !!editingTask?.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({
      taskData,
      subTasksData,
    }: {
      taskData: any;
      subTasksData: SubTask[];
    }) => {
      const taskResponse = await createTask(taskData);

      if (subTasksData.length > 0) {
        const subTasksPayload = subTasksData.map(buildSubTaskPayload); // later removing it.
        await createSubTasks(taskResponse.id, subTasksPayload);
      }
      return taskResponse;
    },
    onSuccess: (taskResponse) => {
      toast.success("Task created successfully!", {
        description: "Your task has been added to the day.",
      });
      clearFormData(taskResponse.id);
      queryClient.refetchQueries({ queryKey: ["planDetails", plan_id] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create task", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      await updateSubTasks(editingTask.id, subTasks); // make changes here later
    },
    onSuccess: () => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
      queryClient.invalidateQueries({
        queryKey: ["taskDetails", editingTask?.id],
      });
      clearFormData(editingTask?.id);
    },
    onError: (error: any) => {
      toast.error("Failed to update task", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (editingTask) {
      form.setValue("title", editingTask.title);
      const subTasksData = taskDetails.subtasks.map((data: any) => {
        switch (data.content_type) {
          case "VIDEO":
            return {
              contentType: "VIDEO",
              videoUrl: data.content,
            };
          case "TEXT":
            return {
              contentType: "TEXT",
              textContent: data.content,
            };
          case "AUDIO":
            return {
              contentType: "AUDIO",
              musicUrl: data.content,
            };
          case "IMAGE":
            return {
              contentType: "IMAGE",
              imagePreview: data.content,
              imageKey: data.image_key,
            };
          default:
            return {
              contentType: "TEXT",
              textContent: data.content || "",
            };
        }
      });
      setSubTasks(subTasksData);
    }
  }, [editingTask?.id, selectedDay, taskDetails?.id]);

  const handleAddSubTask = (
    contentType: "IMAGE" | "VIDEO" | "AUDIO" | "TEXT",
  ) => {
    let newSubTask: SubTask;

    switch (contentType) {
      case "VIDEO":
        newSubTask = {
          contentType: "VIDEO",
          videoUrl: "",
        };
        break;
      case "TEXT":
        newSubTask = {
          contentType: "TEXT",
          textContent: "",
        };
        break;
      case "AUDIO":
        newSubTask = {
          contentType: "AUDIO",
          musicUrl: "",
        };
        break;
      case "IMAGE":
        newSubTask = {
          contentType: "IMAGE",
          imagePreview: null,
          imageKey: null,
        };
        break;
    }

    setSubTasks([...subTasks, newSubTask]);
  };

  const updateSubTask = (index: number, updates: Partial<SubTask>) => {
    setSubTasks((prev) =>
      prev.map((task, i) => {
        if (i !== index) return task;
        return { ...task, ...updates } as SubTask;
      }),
    );
  };

  const removeSubTask = (index: number) => {
    setSubTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubTaskImageUpload = async (index: number, file: File) => {
    try {
      const { url, key } = await uploadImageToS3(file, plan_id || "");
      updateSubTask(index, {
        imagePreview: url,
        imageKey: key,
      });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleRemoveSubTaskImage = (index: number) => {
    updateSubTask(index, { imagePreview: null, imageKey: null });
  };

  const clearFormData = (newlyCreatedTaskId?: string) => {
    setSubTasks([]);
    form.reset();
    onCancel(newlyCreatedTaskId);
  };

  const onSubmit = (data: TaskFormData) => {
    const taskData: any = {
      plan_id: plan_id!,
      day_id: currentDayData!.id,
      title: data.title,
      estimated_time: 30, //doubt here
    };
    if (isEditMode) {
      updateTaskMutation.mutate();
    } else {
      createTaskMutation.mutate({ taskData, subTasksData: subTasks });
    }
  };

  return (
    <div className="w-full h-full border p-4 space-y-4 overflow-y-auto">
      <h2 className="text-xl font-semibold">
        {isEditMode ? "Edit Task" : "Add Task"}
      </h2>
      <Pecha.Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex w-2/3 justify-between items-center gap-4">
            <TaskTitleField
              isEditMode={isEditMode}
              isTitleEditing={isTitleEditing}
              formValue={formValues.title}
              control={form.control}
              onEdit={() => setIsTitleEditing(true)}
              onSave={() => {}}
              onCancel={() => setIsTitleEditing(false)}
            />
          </div>
          <ContentTypeSelector onSelectType={handleAddSubTask} />

          {subTasks.length > 0 && (
            <div className="space-y-4 w-2/3">
              {subTasks.map((subTask, index) => (
                <SubTaskCard
                  key={index}
                  subTask={subTask}
                  index={index}
                  onUpdate={updateSubTask}
                  onRemove={removeSubTask}
                  onImageUpload={handleSubTaskImageUpload}
                  onRemoveImage={handleRemoveSubTaskImage}
                />
              ))}
            </div>
          )}

          <div className="pt-6 flex gap-3">
            <Activity mode={isEditMode ? "visible" : "hidden"}>
              <Pecha.Button
                variant="outline"
                type="button"
                onClick={() => clearFormData()}
              >
                Cancel
              </Pecha.Button>
            </Activity>

            <Pecha.Button
              variant="destructive"
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={
                createTaskMutation.isPending || updateTaskMutation.isPending
              }
            >
              {createTaskMutation.isPending || updateTaskMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update"
                  : "Submit"}
            </Pecha.Button>
          </div>
        </form>
      </Pecha.Form>
    </div>
  );
};

export default TaskForm;
