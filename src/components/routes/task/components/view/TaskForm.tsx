import { useState, useEffect, Activity } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { taskSchema } from "@/schema/TaskSchema";
import { TaskTitleField } from "../../../../ui/molecules/task-title-field/TaskTitleField";
import {
  createTask,
  uploadImageToS3,
  createSubTasks,
  updateSubTasks,
  fetchTaskDetails,
  updateTaskTitle,
} from "../../api/taskApi";
import { ContentTypeSelector } from "@/components/ui/molecules/content-sub/ContentTypeSelector";
import {
  SubTaskCard,
  type SubTask,
} from "@/components/ui/molecules/subtask-card/SubTaskCard";
import DaySelector from "@/components/ui/molecules/day-selector/DaySelector";

interface TaskFormProps {
  selectedDay: number;
  editingTask?: any;
  onCancel: (newlyCreatedTaskId?: string) => void;
  isDraft?: boolean;
}

type TaskFormData = z.infer<typeof taskSchema>;

const TaskForm = ({
  selectedDay,
  editingTask,
  onCancel,
  isDraft = true,
}: TaskFormProps) => {
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
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

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
        const subTasksPayload = subTasksData.map((subTask, index) => ({
          content: subTask.content,
          content_type: subTask.content_type,
          display_order: index + 1,
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
      const subTasksPayload = subTasks.map((subTask, index) => ({
        id: subTask.id || null,
        content: subTask.content,
        content_type: subTask.content_type,
        display_order: index + 1,
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

  const updateTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      await updateTaskTitle(editingTask.id, title);
    },
    onSuccess: () => {
      toast.success("Title updated successfully!");
      setIsTitleEditing(false);
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
      queryClient.invalidateQueries({
        queryKey: ["taskDetails", editingTask?.id],
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update title", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (editingTask && taskDetails) {
      form.setValue("title", editingTask.title);
      const subTasksData = taskDetails.subtasks.map((data: any) => {
        switch (data.content_type) {
          case "VIDEO":
            return {
              id: data.id,
              content_type: "VIDEO",
              content: data.content,
            };
          case "TEXT":
            return {
              id: data.id,
              content_type: "TEXT",
              content: data.content,
            };
          case "AUDIO":
            return {
              id: data.id,
              content_type: "AUDIO",
              content: data.content,
            };
          case "IMAGE":
            return {
              id: data.id,
              content_type: "IMAGE",
              imagePreview: data.content,
              content: data.image_url,
            };
          case "SOURCE_REFERENCE":
            return {
              id: data.id,
              content_type: "SOURCE_REFERENCE",
              content: data.content,
            };
          default:
            return {
              id: data.id,
              content_type: "TEXT",
              content: data.content,
            };
        }
      });
      setSubTasks(subTasksData);
    }
  }, [editingTask?.id, selectedDay, taskDetails?.id]);

  const handleAddSubTask = (content_type: any, sourceContent?: string) => {
    let newSubTask: SubTask;

    switch (content_type) {
      case "VIDEO":
        newSubTask = {
          id: null,
          content_type: "VIDEO",
          content: "",
        };
        break;
      case "TEXT":
        newSubTask = {
          id: null,
          content_type: "TEXT",
          content: "",
        };
        break;
      case "AUDIO":
        newSubTask = {
          id: null,
          content_type: "AUDIO",
          content: "",
        };
        break;
      case "IMAGE":
        newSubTask = {
          id: null,
          content_type: "IMAGE",
          imagePreview: null,
          content: null,
        };
        break;
      case "SOURCE_REFERENCE":
        newSubTask = {
          id: null,
          content_type: "SOURCE_REFERENCE",
          content: sourceContent || "",
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
    setImageUploadError(null);
  };

  const handleSubTaskImageUpload = async (index: number, file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 1) {
      setImageUploadError(
        "File size exceeds 1MB limit. Please select a smaller image.",
      );
      return;
    }
    try {
      const { image, key } = await uploadImageToS3(file, plan_id || "");
      updateSubTask(index, {
        imagePreview: image.original,
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

  const handleSaveTitle = async () => {
    const currentTitle = form.getValues("title");
    if (!currentTitle || currentTitle.trim() === "") {
      toast.error("Title cannot be empty");
      return;
    }
    updateTitleMutation.mutate(currentTitle);
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
    <div className="w-full my-4 h-[calc(100vh-40px)] bg-[#F5F5F5] dark:bg-[#181818] rounded-l-2xl border border-dashed xwspace-y-4 overflow-y-auto">
      <h2 className="text-xl font-semibold p-4">
        {isEditMode ? "Edit Task" : "Add Task"}
      </h2>
      <Pecha.Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex w-full p-4 lg:w-2/3 justify-between items-center gap-4">
            <TaskTitleField
              isEditMode={isEditMode}
              isTitleEditing={isTitleEditing}
              formValue={formValues.title}
              control={form.control}
              onEdit={() => isDraft && setIsTitleEditing(true)}
              onSave={handleSaveTitle}
              onCancel={() => setIsTitleEditing(false)}
              disabled={!isDraft}
            />
            {isEditMode && (
              <DaySelector selectedDay={selectedDay} taskId={editingTask?.id} />
            )}
          </div>

          <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
          <div className=" px-4 flex items-center">
            <h2 className="text-xl font-semibold">Add Subtask</h2>
          </div>

          {subTasks.length > 0 && (
            <div className="space-y-4 p-4 w-full lg:w-2/3">
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
          {imageUploadError && (
            <div className="text-red-500 text-sm ml-4">{imageUploadError}</div>
          )}
          {isDraft && <ContentTypeSelector onSelectType={handleAddSubTask} />}

          <div className="p-4 flex gap-3">
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
                !isDraft ||
                createTaskMutation.isPending ||
                updateTaskMutation.isPending
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
