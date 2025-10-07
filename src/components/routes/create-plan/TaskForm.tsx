import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/atoms/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IoMdAdd, IoMdVideocam, IoMdClose } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { Textarea } from "@/components/ui/atoms/textarea";
import { Input } from "@/components/ui/atoms/input";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import pechaIcon from "../../../assets/icon/pecha_icon.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { toast } from "sonner";

const COMMON_INPUT_CLASSES = "h-12 text-base";
const COMMON_BORDER_CLASSES =
  "border border-gray-300 dark:border-input rounded-sm";
const BUTTON_CLASSES =
  "px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/50 cursor-pointer";

interface TaskFormProps {
  selectedDay: number;
}

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface SubTask {
  id: string;
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
  title: string;
  description: string;
  content_type: "TEXT" | "AUDIO" | "VIDEO" | "IMAGE" | "SOURCE_REFERENCE";
  content: string;
  estimated_time: number;
}

const createTask = async (
  plan_id: string,
  day_id: string,
  taskData: CreateTaskPayload,
) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.post(
    `${BACKEND_BASE_URL}/api/v1/cms/plan/${plan_id}/day/${day_id}/tasks`,
    taskData,
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
    `${BACKEND_BASE_URL}/api/v1/cms/media/upload`,
    formData,
    {
      params: {
        ...(plan_id && { plan_id: plan_id }),
      },
    },
  );
  return data;
};

const TaskForm = ({ selectedDay }: TaskFormProps) => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const queryClient = useQueryClient();
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match?.[1] || "";
  };

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
  const extractSpotifyId = (url: string) => {
    const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };
  const getDayKey = (key: string) => `day_${selectedDay}_${key}`;

  const currentPlan = queryClient.getQueryData<any>(["planDetails", plan_id]);
  const currentDayData = currentPlan?.days?.find(
    (day: any) => day.day_number === selectedDay,
  );

  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTaskPayload) => {
      if (!plan_id || !currentDayData?.id) {
        throw new Error("Plan ID or Day ID not found");
      }
      return createTask(plan_id, currentDayData.id, taskData);
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

  useEffect(() => {
    const savedTitle = localStorage.getItem(getDayKey("title")) || "";
    form.setValue("title", savedTitle);
  }, [selectedDay, form]);

  const handleAddSubTask = (
    contentType: "image" | "video" | "music" | "text",
  ) => {
    const newSubTask: SubTask = {
      id: Date.now().toString(),  //for now we are using date as id, TODO: to update when backend is ready
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

  const updateSubTask = (id: string, field: keyof SubTask, value: any) => {
    setSubTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task)),
    );
  };

  const removeSubTask = (id: string) => {
    const subTask = subTasks.find((t) => t.id === id);
    if (subTask?.imagePreview) {
      URL.revokeObjectURL(subTask.imagePreview);
    }
    setSubTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleSubTaskImageUpload = async (id: string, file: File) => {
    updateSubTask(id, "isUploading", true);
    try {
      const { url, key } = await uploadImageToS3(file, plan_id || "");
      updateSubTask(id, "imagePreview", url);
      updateSubTask(id, "imageFile", file);
      updateSubTask(id, "imageKey", key);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      updateSubTask(id, "isUploading", false);
    }
  };

  const handleRemoveSubTaskImage = (id: string) => {
    const subTask = subTasks.find((t) => t.id === id);
    if (subTask?.imagePreview) {
      URL.revokeObjectURL(subTask.imagePreview);
    }
    updateSubTask(id, "imagePreview", null);
    updateSubTask(id, "imageFile", null);
    updateSubTask(id, "imageKey", null);
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
  };

  const getSubTaskToSubmit = () => {
    if (subTasks.length === 0) return null;
    return subTasks[subTasks.length - 1];
  };

  const onSubmit = (data: TaskFormData) => {
    let content = "";
    let description = "";
    let content_type:
      | "TEXT"
      | "AUDIO"
      | "VIDEO"
      | "IMAGE"
      | "SOURCE_REFERENCE" = "TEXT";

    const subTaskToSubmit = getSubTaskToSubmit();
    if (subTaskToSubmit) {
      switch (subTaskToSubmit.contentType) {
        case "video":
          content_type = "VIDEO";
          content = subTaskToSubmit.videoUrl || "";
          break;
        case "music":
          content_type = "AUDIO";
          content = subTaskToSubmit.musicUrl || "";
          break;
        case "image":
          content_type = "IMAGE";
          content = subTaskToSubmit.imageKey || "";
          break;
        case "text":
          content_type = "TEXT";
          content = subTaskToSubmit.textContent || "";
          break;
      }
    }

    description = subTaskToSubmit?.textContent || data.title;

    const taskData = {
      title: data.title,
      description: description,
      content_type,
      content,
      estimated_time: 30,
    };

    createTaskMutation.mutate(taskData);
  };

  return (
    <div className="w-full h-full border p-4 space-y-4">
      <h2 className="text-xl font-semibold">Add Task</h2>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Task Title"
                    className={COMMON_INPUT_CLASSES}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      localStorage.setItem(getDayKey("title"), e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <button
              type="button"
              className={`${BUTTON_CLASSES} ${COMMON_BORDER_CLASSES}`}
              onClick={() => setShowContentTypes(!showContentTypes)}
              data-testid="add-content-button"
            >
              <IoMdAdd className="w-4 h-4 text-gray-400" />
            </button>

            {showContentTypes && (
              <div className={`flex ${COMMON_BORDER_CLASSES} overflow-hidden`}>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleAddSubTask("image")}
                  data-testid="image-button"
                >
                  <MdOutlineImage className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleAddSubTask("music")}
                  data-testid="music-button"
                >
                  <IoMusicalNotesSharp className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleAddSubTask("video")}
                  data-testid="video-button"
                >
                  <IoMdVideocam className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleAddSubTask("text")}
                  data-testid="text-button"
                >
                  <IoTextOutline className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  data-testid="pecha-button"
                >
                  <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {subTasks.length > 0 && (
            <div className="space-y-4">
              {subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className={`${COMMON_BORDER_CLASSES} p-4 space-y-4`}
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
                    <button
                      type="button"
                      onClick={() => removeSubTask(subTask.id)}
                      className="text-[#A51C21] hover:text-[#8B1419] cursor-pointer"
                    >
                      <IoMdClose className="w-4 h-4" />
                    </button>
                  </div>

                  {subTask.contentType === "video" && (
                    <>
                      <Input
                        type="url"
                        placeholder="Enter YouTube URL"
                        className={COMMON_INPUT_CLASSES}
                        value={subTask.videoUrl}
                        onChange={(e) =>
                          updateSubTask(subTask.id, "videoUrl", e.target.value)
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
                    <Textarea
                      placeholder="Enter your text content"
                      className="w-full h-24 resize-none text-base"
                      value={subTask.textContent}
                      onChange={(e) =>
                        updateSubTask(subTask.id, "textContent", e.target.value)
                      }
                    />
                  )}

                  {subTask.contentType === "music" && (
                    <>
                      <Input
                        type="url"
                        placeholder="Enter Spotify or SoundCloud URL"
                        className={COMMON_INPUT_CLASSES}
                        value={subTask.musicUrl}
                        onChange={(e) =>
                          updateSubTask(subTask.id, "musicUrl", e.target.value)
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
                            handleSubTaskImageUpload(subTask.id, file)
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
                      {subTask.imagePreview && subTask.imageFile && (
                        <div className="mt-4 flex justify-center">
                          <div className="relative w-fit">
                            <img
                              src={subTask.imagePreview}
                              alt="Final uploaded image"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSubTaskImage(subTask.id)
                              }
                              className="absolute top-2 right-2 bg-gray-600 text-white rounded-full p-1 cursor-pointer transition-colors"
                              data-testid="remove-image-button"
                            >
                              <IoMdClose className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="pt-6">
            <button
              type="submit"
              className="bg-[#A51C21] text-white px-8 py-3 rounded-md font-medium hover:bg-[#8B1419] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-button"
              disabled={!isFormValid || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Submit"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskForm;
