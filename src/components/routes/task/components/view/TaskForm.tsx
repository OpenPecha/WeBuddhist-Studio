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
        const subTasksPayload = subTasksData.map((subTask) => ({
          content: subTask.content,
          content_type: subTask.content_type,
        }));
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
      const subTasksPayload = subTasks.map((subTask) => ({
        content: subTask.content,
        content_type: subTask.content_type,
      }));
      await updateSubTasks(editingTask.id, subTasksPayload);
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
              content_type: "VIDEO",
              content: data.content,
            };
          case "TEXT":
            return {
              content_type: "TEXT",
              content: data.content,
            };
          case "AUDIO":
            return {
              content_type: "AUDIO",
              content: data.content,
            };
          case "IMAGE":
            return {
              content_type: "IMAGE",
              imagePreview: data.content,
              content: data.image_url,
            };
          default:
            return {
              content_type: "TEXT",
              content: data.content,
            };
        }
      });
      setSubTasks(subTasksData);
    }
  }, [editingTask?.id, selectedDay, taskDetails?.id]);

  const handleAddSubTask = (content_type: any) => {
    let newSubTask: SubTask;

    switch (content_type) {
      case "VIDEO":
        newSubTask = {
          content_type: "VIDEO",
          content: "",
        };
        break;
      case "TEXT":
        newSubTask = {
          content_type: "TEXT",
          content: "",
        };
        break;
      case "AUDIO":
        newSubTask = {
          content_type: "AUDIO",
          content: "",
        };
        break;
      case "IMAGE":
        newSubTask = {
          content_type: "IMAGE",
          imagePreview: null,
          content: null,
        };
        break;
    }

    setSubTasks([...subTasks, newSubTask!]);
  };

  const updateSubTask = (index: number, updates: any) => {
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
        content: key,
      });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleRemoveSubTaskImage = (index: number) => {
    updateSubTask(index, { imagePreview: null, content: null });
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
      estimated_time: 30,
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
          <div className="flex w-full lg:w-2/3 justify-between items-center gap-4">
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
            <div className="space-y-4 w-full lg:w-2/3">
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

          <div className="pt-6 flex border gap-3">
            {/* <Pecha.dr */}
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
