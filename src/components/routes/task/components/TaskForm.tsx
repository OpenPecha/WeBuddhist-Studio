import { useState, useEffect } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IoMdAdd, IoMdVideocam, IoMdClose } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import pechaIcon from "@/assets/icon/pecha_icon.png";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { toast } from "sonner";
import { extractSpotifyId, getYouTubeVideoId } from "@/lib/utils";
import { taskSchema } from "@/schema/TaskSchema";
import { FaMinus } from "react-icons/fa6";

interface TaskFormProps {
  selectedDay: number;
  editingTask?: any;
  onCancel: () => void;
}

interface SubTask {
  id: string | null;
  contentType: "image" | "video" | "music" | "text";
  videoUrl: string;
  textContent: string;
  musicUrl: string;
  imageFile: File | null;
  imagePreview: string | null;
  imageKey: string | null;
  isUploading: boolean;
}

interface CreateTaskPayload {
  plan_id: string;
  day_id: string;
  title: string;
  description: string;
  estimated_time: number;
}

type TaskFormData = z.infer<typeof taskSchema>;

const contentTypes = [
  {
    key: "image",
    icon: <MdOutlineImage className="w-4 h-4 text-gray-400" />,
    testid: "image-button",
  },
  {
    key: "music",
    icon: <IoMusicalNotesSharp className="w-4 h-4 text-gray-400" />,
    testid: "music-button",
  },
  {
    key: "video",
    icon: <IoMdVideocam className="w-4 h-4 text-gray-400" />,
    testid: "video-button",
  },
  {
    key: "text",
    icon: <IoTextOutline className="w-4 h-4 text-gray-400" />,
    testid: "text-button",
  },
  {
    key: "pecha",
    icon: <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />,
    testid: "pecha-button",
  },
];

const SUBTASK_CONTENT_MAP = {
  video: { field: "videoUrl", type: "VIDEO" },
  text: { field: "textContent", type: "TEXT" },
  music: { field: "musicUrl", type: "AUDIO" },
  image: { field: "imageKey", type: "IMAGE" },
} as const;

const transformSubTask = (subTask: SubTask) => {
  const mapping = SUBTASK_CONTENT_MAP[subTask.contentType];
  if (!mapping) {
    return { content: "", content_type: "TEXT" };
  }

  const content = subTask[mapping.field as keyof SubTask] as string;
  return {
    content: content || "",
    content_type: mapping.type,
  };
};

const createTask = async (
  plan_id: string,
  day_id: string,
  taskData: CreateTaskPayload,
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `/api/v1/cms/tasks`,
    { ...taskData, plan_id, day_id },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

const uploadImageToS3 = async (file: File, plan_id: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post(
    `/api/v1/cms/media/upload`,
    formData,
    {
      params: {
        ...(plan_id && { plan_id: plan_id }),
      },
    },
  );
  return data;
};

const createSubTasks = async (
  task_id: string,
  subTasksData: { content: string; content_type: string }[],
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

const updateSubTasks = async (
  task_id: string,
  subTasksData: {
    id: string;
    content: string;
    content_type: string;
    display_order: number;
  }[],
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  await axiosInstance.put(
    `/api/v1/cms/sub-tasks`,
    {
      task_id: task_id,
      sub_tasks: subTasksData,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

const extractS3KeyFromPresignedUrl = (url: string): string => {
  try {
    if (!url || !url.startsWith("http")) {
      return url;
    }
    const urlObj = new URL(url);
    let s3Key = urlObj.pathname.substring(1);
    s3Key = decodeURIComponent(s3Key);
    if (s3Key.startsWith("http")) {
      const secondUrlObj = new URL(s3Key);
      s3Key = secondUrlObj.pathname.substring(1);
      s3Key = decodeURIComponent(s3Key);
    }
    return s3Key;
  } catch (error) {
    console.error("Failed to extract S3 key:", error);
    return url;
  }
};

const TaskForm = ({ selectedDay, editingTask, onCancel }: TaskFormProps) => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const queryClient = useQueryClient();
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
    },
  });
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [showContentTypes, setShowContentTypes] = useState(false);
  const formValues = form.watch();
  const isFormValid = formValues.title.trim().length > 0;

  const getDayKey = (key: string) => `day_${selectedDay}_${key}`;
  const isEditMode = !!editingTask;

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
    mutationFn: async (taskData: CreateTaskPayload) => {
      if (!plan_id || !currentDayData?.id) {
        throw new Error("Plan ID or Day ID not found");
      }

      const taskResponse = await createTask(
        plan_id,
        currentDayData.id,
        taskData,
      );

      if (subTasks.length > 0) {
        const subTasksPayload = subTasks
          .map(transformSubTask)
          .filter((st) => st.content.trim() !== "");

        if (subTasksPayload.length > 0) {
          await createSubTasks(taskResponse.id, subTasksPayload);
        }
      }

      return taskResponse;
    },
    onSuccess: () => {
      toast.success("Task created successfully!", {
        description: "Your task has been added to the day.",
      });
      clearFormData();
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
      if (!editingTask?.id) {
        throw new Error("Task ID not found");
      }
      const newSubtasks = subTasks.filter((st) => st.id === null);
      let createdSubTasks: any[] = [];
      if (newSubtasks.length > 0) {
        const newSubTasksPayload = newSubtasks
          .map(transformSubTask)
          .filter((st) => st.content.trim() !== "");
        if (newSubTasksPayload.length > 0) {
          const createResponse = await createSubTasks(
            editingTask.id,
            newSubTasksPayload,
          );
          createdSubTasks = createResponse.sub_tasks || [];
        }
      }
      const updatePayload: any[] = [];
      let createdIndex = 0;
      for (let i = 0; i < subTasks.length; i++) {
        const st = subTasks[i];
        let subtaskId: string;
        let contentToSend: string;
        let contentTypeToSend: string;
        if (st.id !== null) {
          subtaskId = st.id;
          contentToSend = transformSubTask(st).content;
          contentTypeToSend = transformSubTask(st).content_type;
        } else {
          const createdSubTask = createdSubTasks[createdIndex];
          if (!createdSubTask) {
            throw new Error(
              `Could not find created subtask at position ${i + 1}`,
            );
          }
          subtaskId = createdSubTask.id;
          createdIndex++;
          if (createdSubTask.content_type === "IMAGE") {
            contentToSend = extractS3KeyFromPresignedUrl(
              createdSubTask.content,
            );
          } else {
            contentToSend = createdSubTask.content;
          }
          contentTypeToSend = createdSubTask.content_type;
        }
        updatePayload.push({
          id: subtaskId,
          content: contentToSend,
          content_type: contentTypeToSend,
          display_order: i + 1,
        });
      }
      await updateSubTasks(editingTask.id, updatePayload);
    },
    onSuccess: () => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
      queryClient.invalidateQueries({
        queryKey: ["taskDetails", editingTask?.id],
      });
      clearFormData();
    },
    onError: (error: any) => {
      console.error("Update failed:", error);
      toast.error("Failed to update task", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (editingTask && taskDetails && taskDetails.id === editingTask.id) {
      form.setValue("title", editingTask.title);
      const transformedSubTasks: SubTask[] = taskDetails.subtasks
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((st: any) => ({
          id: st.id,
          contentType:
            st.content_type === "VIDEO"
              ? "video"
              : st.content_type === "TEXT"
                ? "text"
                : st.content_type === "AUDIO"
                  ? "music"
                  : st.content_type === "IMAGE"
                    ? "image"
                    : "text",
          videoUrl: st.content_type === "VIDEO" ? st.content : "",
          textContent: st.content_type === "TEXT" ? st.content : "",
          musicUrl: st.content_type === "AUDIO" ? st.content : "",
          imageFile: null,
          imagePreview: st.content_type === "IMAGE" ? st.content : null,
          imageKey:
            st.content_type === "IMAGE"
              ? extractS3KeyFromPresignedUrl(st.content)
              : null,
          isUploading: false,
        }));

      setSubTasks(transformedSubTasks);
    } else if (!editingTask) {
      const savedTitle = localStorage.getItem(getDayKey("title"));
      if (savedTitle) {
        form.setValue("title", savedTitle);
      } else {
        form.reset();
      }
      setSubTasks([]);
    }
  }, [editingTask?.id, selectedDay, taskDetails?.id]);

  const handleAddSubTask = (
    contentType: "image" | "video" | "music" | "text",
  ) => {
    const newSubTask: SubTask = {
      id: null,
      contentType,
      videoUrl: "",
      textContent: "",
      musicUrl: "",
      imageFile: null,
      imagePreview: null,
      imageKey: null,
      isUploading: false,
    };
    setSubTasks([...subTasks, newSubTask]);
  };

  const updateSubTask = (index: number, field: keyof SubTask, value: any) => {
    setSubTasks((prev) =>
      prev.map((task, i) => (i === index ? { ...task, [field]: value } : task)),
    );
  };

  const removeSubTask = (index: number) => {
    const subTask = subTasks[index];
    if (subTask?.imagePreview) {
      URL.revokeObjectURL(subTask.imagePreview);
    }
    setSubTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubTaskImageUpload = async (index: number, file: File) => {
    updateSubTask(index, "isUploading", true);
    try {
      const { url, key } = await uploadImageToS3(file, plan_id || "");
      updateSubTask(index, "imagePreview", url);
      updateSubTask(index, "imageFile", file);
      updateSubTask(index, "imageKey", key);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      updateSubTask(index, "isUploading", false);
    }
  };

  const handleRemoveSubTaskImage = (index: number) => {
    const subTask = subTasks[index];
    if (subTask?.imagePreview) {
      URL.revokeObjectURL(subTask.imagePreview);
    }
    updateSubTask(index, "imagePreview", null);
    updateSubTask(index, "imageFile", null);
    updateSubTask(index, "imageKey", null);
  };

  const clearFormData = () => {
    subTasks.forEach((subTask) => {
      if (subTask.imagePreview) {
        URL.revokeObjectURL(subTask.imagePreview);
      }
    });
    localStorage.removeItem(getDayKey("title"));
    setSubTasks([]);
    setShowContentTypes(false);
    form.reset();
    onCancel();
  };

  const onSubmit = (data: TaskFormData) => {
    const taskData: CreateTaskPayload = {
      plan_id: plan_id!,
      day_id: currentDayData!.id,
      title: data.title,
      description: data.title,
      estimated_time: 30,
    };

    if (isEditMode) {
      updateTaskMutation.mutate();
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  return (
    <div className="w-full h-full border p-4 space-y-4 overflow-y-auto">
      <h2 className="text-xl font-semibold">
        {isEditMode ? "Edit Task" : "Add Task"}
      </h2>
      <Pecha.Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Pecha.FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <Pecha.FormItem>
                <Pecha.FormControl>
                  <Pecha.Input
                    type="text"
                    placeholder="Task Title"
                    className="h-12 text-base"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      localStorage.setItem(getDayKey("title"), e.target.value);
                    }}
                  />
                </Pecha.FormControl>
                <Pecha.FormMessage />
              </Pecha.FormItem>
            )}
          />

          <div className="flex gap-4">
            <Pecha.Button
              type="button"
              variant="outline"
              onClick={() => setShowContentTypes(!showContentTypes)}
              data-testid="add-content-button"
            >
              <IoMdAdd className="w-4 h-4 text-gray-400" />
            </Pecha.Button>

            {showContentTypes && (
              <div
                className={`flex border border-gray-300 dark:border-input rounded-sm overflow-hidden`}
              >
                {contentTypes.map(({ key, icon, testid }) => (
                  <Pecha.Button
                    key={key}
                    type="button"
                    variant="ghost"
                    onClick={() => handleAddSubTask(key as any)}
                    data-testid={testid}
                  >
                    {icon}
                  </Pecha.Button>
                ))}
              </div>
            )}
          </div>

          {subTasks.length > 0 && (
            <div className="space-y-4">
              {subTasks.map((subTask, index) => (
                <div
                  key={
                    subTask.id
                      ? `subtask-${subTask.id}`
                      : `new-subtask-${index}`
                  }
                  className={`border border-gray-300 ${subTask.contentType === "image" ? "w-fit" : ""} dark:border-input rounded-sm p-4 space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {subTask.contentType === "video" && (
                        <IoMdVideocam className="w-4 h-4 text-gray-600" />
                      )}
                      {subTask.contentType === "text" && (
                        <IoTextOutline className="w-4 h-4 text-gray-600" />
                      )}
                      {subTask.contentType === "music" && (
                        <IoMusicalNotesSharp className="w-4 h-4 text-gray-600" />
                      )}
                      {subTask.contentType === "image" && (
                        <MdOutlineImage className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <Pecha.Button
                      variant="outline"
                      type="button"
                      onClick={() => removeSubTask(index)}
                    >
                      <IoMdClose className="w-4 h-4" />
                    </Pecha.Button>
                  </div>

                  {subTask.contentType === "video" && (
                    <>
                      <Pecha.Input
                        type="url"
                        placeholder="Enter YouTube URL"
                        className="h-12 text-base"
                        value={subTask.videoUrl}
                        onChange={(e) =>
                          updateSubTask(index, "videoUrl", e.target.value)
                        }
                      />
                      {(() => {
                        const videoId = getYouTubeVideoId(subTask.videoUrl);
                        return videoId.length > 0 ? (
                          <div className="mt-4">
                            <iframe
                              className="w-full aspect-video rounded-md border"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="YouTube preview"
                            />
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}

                  {subTask.contentType === "text" && (
                    <Pecha.Textarea
                      placeholder="Enter your text content"
                      className="w-full h-24 resize-none text-base"
                      value={subTask.textContent}
                      onChange={(e) =>
                        updateSubTask(index, "textContent", e.target.value)
                      }
                    />
                  )}

                  {subTask.contentType === "music" && (
                    <>
                      <Pecha.Input
                        type="url"
                        placeholder="Enter Spotify or SoundCloud URL"
                        className="h-12 text-base"
                        value={subTask.musicUrl}
                        onChange={(e) =>
                          updateSubTask(index, "musicUrl", e.target.value)
                        }
                      />
                      {subTask.musicUrl && (
                        <div className="mt-4">
                          {subTask.musicUrl.includes("spotify.com") &&
                            (() => {
                              const spotifyData = extractSpotifyId(
                                subTask.musicUrl,
                              );
                              return spotifyData ? (
                                <div className="w-full rounded-md overflow-hidden">
                                  <iframe
                                    src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator`}
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    className="w-full h-40 border-0"
                                  />
                                </div>
                              ) : null;
                            })()}

                          {subTask.musicUrl.includes("soundcloud.com") && (
                            <div className="w-full rounded-md overflow-hidden">
                              <iframe
                                allow="autoplay"
                                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(subTask.musicUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                                className="w-full h-40 border-0"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {subTask.contentType === "image" && (
                    <>
                      {!subTask.imagePreview && !subTask.isUploading && (
                        <InlineImageUpload
                          onUpload={(file) =>
                            handleSubTaskImageUpload(index, file)
                          }
                          uploadedImage={subTask.imageFile}
                        />
                      )}
                      {subTask.isUploading && (
                        <div className="flex items-center justify-center h-32 border border-dashed border-gray-300 rounded-lg">
                          <span className="text-gray-600">
                            Uploading image...
                          </span>
                        </div>
                      )}
                      {subTask.imagePreview && (
                        <div className="mt-4 flex w-full justify-center">
                          <div className="relative">
                            <img
                              src={subTask.imagePreview}
                              alt="Final uploaded image"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Pecha.Button
                              variant="default"
                              className="absolute top-2 right-2"
                              type="button"
                              onClick={() => handleRemoveSubTaskImage(index)}
                              data-testid="remove-image-button"
                            >
                              <FaMinus className="w-4 h-4" />
                            </Pecha.Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 flex gap-3">
            {isEditMode && (
              <Pecha.Button
                variant="outline"
                type="button"
                onClick={clearFormData}
                data-testid="cancel-button"
              >
                Cancel
              </Pecha.Button>
            )}
            <Pecha.Button
              variant="destructive"
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              data-testid="submit-button"
              disabled={
                !isFormValid ||
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
