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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { toast } from "sonner";
import { extractSpotifyId, getYouTubeVideoId } from "@/lib/utils";
import { taskSchema } from "@/schema/TaskSchema";
import { FaMinus } from "react-icons/fa6";

interface TaskFormProps {
  selectedDay: number;
}
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
  estimated_time: number;
  subtasks: {
    content_type: "TEXT" | "AUDIO" | "VIDEO" | "IMAGE" | "SOURCE_REFERENCE";
    content: string;
    display_order: number;
  }[];
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
      id: Date.now().toString(), //for now we are using date as id, TODO: to update when backend is ready
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

  // const getSubTaskToSubmit = () => {
  //   if (subTasks.length === 0) return null;
  //   return subTasks[subTasks.length - 1];
  // };

  const onSubmit = (data: TaskFormData) => {
      const formattedSubTasks = subTasks.map((subTask, index) => {
    let content = "";
    // let description = "";
    let content_type:
      | "TEXT"
      | "AUDIO"
      | "VIDEO"
      | "IMAGE"
      | "SOURCE_REFERENCE" = "TEXT";

    // const subTaskToSubmit = getSubTaskToSubmit();
    // if (subTaskToSubmit) {
      switch (subTask.contentType) {
        case "video":
          content_type = "VIDEO";
          content = subTask.videoUrl || "";
          break;
        case "music":
          content_type = "AUDIO";
          content = subTask.musicUrl || "";
          break;
        case "image":
          content_type = "IMAGE";
          content = subTask.imageKey || "";
          break;
        case "text":
          content_type = "TEXT";
          content = subTask.textContent || "";
          break;
      }
    return {
      content_type,
      content,
      display_order: index + 1,
    };
  });
  //   description = subTaskToSubmit?.textContent || data.title;

  //   const taskData = {
  //     title: data.title,
  //     description: description,
  //     content_type,
  //     content,
  //     estimated_time: 30,
  //   };

  const taskData: CreateTaskPayload = {
    title: data.title,
    description: data.title, 
    estimated_time: 30,
    subtasks: formattedSubTasks 
  };

  console.log("will send:", taskData);
  toast.info(`Result: ${formattedSubTasks.length} subtasks`);
  //   createTaskMutation.mutate(taskData);
  };

  return (
    <div className="w-full h-full border p-4 space-y-4 overflow-y-auto">
      <h2 className="text-xl font-semibold">Add Task</h2>
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
              {subTasks.map((subTask) => (
                <div
                  key={subTask.id}
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
                      onClick={() => removeSubTask(subTask.id)}
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
                    <Pecha.Textarea
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
                      <Pecha.Input
                        type="url"
                        placeholder="Enter Spotify or SoundCloud URL"
                        className="h-12 text-base"
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
                              onClick={() =>
                                handleRemoveSubTaskImage(subTask.id)
                              }
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
          <div className="pt-6">
            <Pecha.Button
              variant="destructive"
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              data-testid="submit-button"
              disabled={!isFormValid || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Submit"}
            </Pecha.Button>
          </div>
        </form>
      </Pecha.Form>
    </div>
  );
};

export default TaskForm;
