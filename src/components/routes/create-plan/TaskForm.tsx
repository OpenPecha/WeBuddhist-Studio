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

interface TaskFormProps {
  selectedDay: number;
}

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  videoUrl: z
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  textContent: z.string().optional(),
  musicUrl: z
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type TaskFormData = z.infer<typeof taskSchema>;

const TaskForm = ({ selectedDay }: TaskFormProps) => {
  const BUTTON_CLASSES =
    "px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/50 cursor-pointer";
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match?.[1] || "";
  };

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
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
  const isFormValid =
    form.formState.isValid && formValues.title.trim().length > 0;
  const extractSpotifyId = (url: string) => {
    const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };
  const getDayKey = (key: string) => `day_${selectedDay}_${key}`;

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

  const clearFormData = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    localStorage.removeItem(getDayKey("activeContentType"));
    localStorage.removeItem(getDayKey("title"));

    setActiveContentType(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowContentTypes(false);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#413F3F" }}>
        Add Task
      </h2>
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            console.log("Form submitted:", data);
            clearFormData();
            form.reset();
          })}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Task Title"
                    className="h-12 text-base"
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
              className={`${BUTTON_CLASSES} border border-gray-300 dark:border-input rounded-sm`}
              onClick={() => setShowContentTypes(!showContentTypes)}
              data-testid="add-content-button"
            >
              <IoMdAdd className="w-4 h-4 text-gray-400" />
            </button>

            {showContentTypes && (
              <div className="flex border border-gray-300 dark:border-input rounded-sm overflow-hidden">
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleContentTypeToggle("image")}
                  data-testid="image-button"
                >
                  <MdOutlineImage className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleContentTypeToggle("music")}
                  data-testid="music-button"
                >
                  <IoMusicalNotesSharp className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleContentTypeToggle("video")}
                  data-testid="video-button"
                >
                  <IoMdVideocam className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  className={BUTTON_CLASSES}
                  onClick={() => handleContentTypeToggle("text")}
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
          {activeContentType && (
            <div className="border border-gray-300 dark:border-input rounded-sm p-4">
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
                            className="h-12 text-base"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
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
                            onChange={(e) => {
                              field.onChange(e);
                            }}
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
                            className="h-12 text-base"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
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
                  {!imagePreview && (
                    <InlineImageUpload
                      onUpload={(file) => {
                        const imageUrl = URL.createObjectURL(file);
                        setImagePreview(imageUrl);
                        setSelectedImage(file);
                      }}
                      uploadedImage={selectedImage}
                    />
                  )}
                  {imagePreview && selectedImage && (
                    <div className="mt-4 p-3 rounded-lg flex justify-center">
                      <div>
                        <p className="text-sm font-medium text-center mb-2 text-gray-700 dark:text-gray-300">
                          Uploaded Image:
                        </p>
                        <div className="relative w-fit">
                          <img
                            src={imagePreview}
                            alt="Final uploaded image"
                            className="w-48 h-32 object-cover rounded-lg border"
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
              disabled={!isFormValid}
            >
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskForm;
