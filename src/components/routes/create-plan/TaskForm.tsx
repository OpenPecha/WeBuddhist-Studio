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
  videoUrl: z
    .union([z.literal(""), z.url("Please enter a valid YouTube URL")])
    .optional(),
  textContent: z.string().optional(),
  musicUrl: z
    .union([z.literal(""), z.url("Please enter a valid music platform URL")])
    .optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

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
  const getButtonClass = (contentType: string) => {
    return `${BUTTON_CLASSES} ${
      activeContentType === contentType ? "bg-accent" : ""
    }`;
  };
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
      videoUrl: "",
      textContent: "",
      musicUrl: "",
    },
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showContentTypes, setShowContentTypes] = useState(false);
  const [activeContentType, setActiveContentType] = useState<string | null>(
    null,
  );
  const formValues = form.watch();
  const youTubeVideoId = getYouTubeVideoId(formValues.videoUrl || "");
  const hasValidYouTubeId = youTubeVideoId.length > 0;
  const isFormValid = formValues.title.trim().length > 0;
  const extractSpotifyId = (url: string) => {
    const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    const savedContentType = localStorage.getItem(
      getDayKey("activeContentType"),
    );
    const savedTitle = localStorage.getItem(getDayKey("title")) || "";

    form.setValue("title", savedTitle);

    if (savedContentType) {
      setActiveContentType(savedContentType);
      setShowContentTypes(true);
    }
  }, [selectedDay, form]);

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setImageKey(null);
  };

  const handleContentTypeToggle = (contentType: string) => {
    if (activeContentType === contentType) {
      setActiveContentType(null);
      localStorage.removeItem(getDayKey("activeContentType"));
    } else {
      setActiveContentType(contentType);
      localStorage.setItem(getDayKey("activeContentType"), contentType);
    }
    setShowContentTypes(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { url, key } = await uploadImageToS3(file, plan_id || "");
      setImagePreview(url);
      setSelectedImage(file);
      setImageKey(key);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFormData = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    localStorage.removeItem(getDayKey("activeContentType"));
    localStorage.removeItem(getDayKey("title"));

    setActiveContentType(null);
    setSelectedImage(null);
    setImagePreview(null);
    setImageKey(null);
    setIsUploading(false);
    setShowContentTypes(false);
    form.reset();
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

    switch (activeContentType) {
      case "video":
        content_type = "VIDEO";
        content = data.videoUrl || "";
        break;
      case "music":
        content_type = "AUDIO";
        content = data.musicUrl || "";
        break;
      case "image":
        content_type = "IMAGE";
        content = imageKey || "";
        break;
      case "text":
      default:
        content_type = "TEXT";
        content = data.textContent || "";
    }
    description = data.textContent || data.title;

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
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#413F3F" }}>
        Add Task
      </h2>
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
                  className={getButtonClass("image")}
                  onClick={() => handleContentTypeToggle("image")}
                  data-testid="image-button"
                >
                  <MdOutlineImage className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={getButtonClass("music")}
                  onClick={() => handleContentTypeToggle("music")}
                  data-testid="music-button"
                >
                  <IoMusicalNotesSharp className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={getButtonClass("video")}
                  onClick={() => handleContentTypeToggle("video")}
                  data-testid="video-button"
                >
                  <IoMdVideocam className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={getButtonClass("text")}
                  onClick={() => handleContentTypeToggle("text")}
                  data-testid="text-button"
                >
                  <IoTextOutline className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={getButtonClass("pecha")}
                  data-testid="pecha-button"
                >
                  <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {activeContentType && (
            <div className={`${COMMON_BORDER_CLASSES} p-4`}>
              <div className="flex items-center gap-2 mb-3 justify-end">
                {activeContentType === "video" && (
                  <IoMdVideocam className="w-4 h-4 text-gray-600" />
                )}
                {activeContentType === "text" && (
                  <IoTextOutline className="w-4 h-4 text-gray-600" />
                )}
                {activeContentType === "music" && (
                  <IoMusicalNotesSharp className="w-4 h-4 text-gray-600" />
                )}
                {activeContentType === "image" && (
                  <MdOutlineImage className="w-4 h-4 text-gray-600" />
                )}
              </div>
              {activeContentType === "video" && (
                <>
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Enter YouTube URL"
                            className={COMMON_INPUT_CLASSES}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {hasValidYouTubeId && (
                    <div className="mt-4">
                      <iframe
                        className="w-full aspect-video rounded-md border"
                        src={`https://www.youtube.com/embed/${youTubeVideoId}`}
                        title="YouTube preview"
                      />
                    </div>
                  )}
                </>
              )}

              {activeContentType === "text" && (
                <>
                  <FormField
                    control={form.control}
                    name="textContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your text content"
                            className="w-full h-24 resize-none text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {activeContentType === "music" && (
                <>
                  <FormField
                    control={form.control}
                    name="musicUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Enter Spotify or SoundCloud URL"
                            className={COMMON_INPUT_CLASSES}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {formValues.musicUrl && (
                    <div className="mt-4">
                      {formValues.musicUrl?.includes("spotify.com") &&
                        (() => {
                          const spotifyData = extractSpotifyId(
                            formValues.musicUrl || "",
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

                      {formValues.musicUrl?.includes("soundcloud.com") && (
                        <div className="w-full rounded-md overflow-hidden">
                          <iframe
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(formValues.musicUrl || "")}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                            className="w-full h-40 border-0"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {activeContentType === "image" && (
                <>
                  {!imagePreview && !isUploading && (
                    <InlineImageUpload
                      onUpload={handleImageUpload}
                      uploadedImage={selectedImage}
                    />
                  )}
                  {isUploading && (
                    <div className="flex items-center justify-center h-32 border border-dashed border-gray-300 rounded-lg">
                      <span className="text-gray-600">Uploading image...</span>
                    </div>
                  )}
                  {imagePreview && selectedImage && (
                    <div className="mt-4 flex justify-center">
                      <div>
                        <p className="text-sm font-medium text-center mb-2 text-gray-700 dark:text-gray-300">
                          Uploaded Image:
                        </p>
                        <div className="relative w-fit">
                          <img
                            src={imagePreview}
                            alt="Final uploaded image"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-gray-600 text-white rounded-full p-1 cursor-pointer transition-colors"
                            data-testid="remove-image-button"
                          >
                            <IoMdClose className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
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
