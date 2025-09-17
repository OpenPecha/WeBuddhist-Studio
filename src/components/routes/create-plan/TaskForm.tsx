import { useState, useEffect } from "react";
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

const TaskForm = ({ selectedDay }: TaskFormProps) => {
  const BUTTON_CLASSES =
    "px-4 py-3 hover:bg-gray-50 dark:hover:bg-accent/50 cursor-pointer";
  const YOUTUBE_REGEX =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const MUSIC_URL_REGEX =
    /https?:\/\/(?:open\.spotify\.com\/(track|album)\/[a-zA-Z0-9]+|(?:www\.)?soundcloud\.com\/[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)/;
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showContentTypes, setShowContentTypes] = useState(false);
  const [activeContentType, setActiveContentType] = useState<string | null>(
    null,
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const youTubeVideoId = videoUrl.match(YOUTUBE_REGEX)?.[1] || "";
  const isValidYouTube = youTubeVideoId.length > 0;
  const isValidMusicUrl = musicUrl.length > 0 && MUSIC_URL_REGEX.test(musicUrl);
  const isFormValid = title.trim().length > 0;
  const extractSpotifyId = (url: string) => {
    const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };

  useEffect(() => {
    const savedContentType = localStorage.getItem("activeContentType");
    const savedVideoUrl = localStorage.getItem("videoUrl");
    const savedTextContent = localStorage.getItem("textContent");
    const savedMusicUrl = localStorage.getItem("musicUrl");

    if (savedContentType) {
      setActiveContentType(savedContentType);
      setShowContentTypes(true);
    }
    if (savedVideoUrl) {
      setVideoUrl(savedVideoUrl);
    }
    if (savedTextContent) {
      setTextContent(savedTextContent);
    }
    if (savedMusicUrl) {
      setMusicUrl(savedMusicUrl);
    }
  }, []);

  useEffect(() => {
    clearFormData();
    setTitle("");
  }, [selectedDay]);

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
      localStorage.removeItem("activeContentType");
    } else {
      setActiveContentType(contentType);
      localStorage.setItem("activeContentType", contentType);
    }
    setShowContentTypes(true);
  };

  const clearFormData = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    localStorage.removeItem("activeContentType");
    localStorage.removeItem("videoUrl");
    localStorage.removeItem("textContent");
    localStorage.removeItem("musicUrl");
    setActiveContentType(null);
    setVideoUrl("");
    setTextContent("");
    setMusicUrl("");
    setSelectedImage(null);
    setImagePreview(null);
    setShowContentTypes(false);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#413F3F" }}>
        Add Task
      </h2>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          clearFormData();
          setTitle("");
        }}
      >
        <div>
          <Input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base"
          />
        </div>
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
                onClick={() => {
                  setActiveContentType("image");
                  localStorage.setItem("activeContentType", "image");
                }}
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
        {activeContentType === "video" && (
          <div className="border border-gray-300 dark:border-input rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <IoMdVideocam className="w-4 h-4 text-gray-600" />
            </div>
            <Input
              type="url"
              placeholder="Enter YouTube URL"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                localStorage.setItem("videoUrl", e.target.value);
              }}
              className="h-12 text-base"
            />
            {videoUrl && !isValidYouTube && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid YouTube URL
              </p>
            )}
            {isValidYouTube && (
              <div className="mt-4">
                <iframe
                  className="w-full aspect-video rounded-md border"
                  src={`https://www.youtube.com/embed/${youTubeVideoId}`}
                  title="YouTube preview"
                />
              </div>
            )}
          </div>
        )}

        {activeContentType === "text" && (
          <div className="border border-gray-300 dark:border-input rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <IoTextOutline className="w-4 h-4 text-gray-600" />
            </div>
            <Textarea
              placeholder="Enter your text content"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                localStorage.setItem("textContent", e.target.value);
              }}
              className="w-full h-24 resize-none text-base"
            />
          </div>
        )}

        {activeContentType === "music" && (
          <div className="border border-gray-300 dark:border-input rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <IoMusicalNotesSharp className="w-4 h-4 text-gray-600" />
            </div>
            <Input
              type="url"
              placeholder="Enter Spotify or SoundCloud URL"
              value={musicUrl}
              onChange={(e) => {
                setMusicUrl(e.target.value);
                localStorage.setItem("musicUrl", e.target.value);
              }}
              className="h-12 text-base"
            />
            {musicUrl && !isValidMusicUrl && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid music platform URL
              </p>
            )}
            {isValidMusicUrl && (
              <div className="mt-4">
                {musicUrl.includes("spotify.com") &&
                  (() => {
                    const spotifyData = extractSpotifyId(musicUrl);
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

                {musicUrl.includes("soundcloud.com") && (
                  <div className="w-full rounded-md overflow-hidden">
                    <iframe
                      allow="autoplay"
                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(musicUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                      className="w-full h-40 border-0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeContentType === "image" && (
          <div className="border border-gray-300 dark:border-input rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <MdOutlineImage className="w-4 h-4 text-gray-600" />
            </div>

            <InlineImageUpload
              onUpload={(file) => {
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
                setSelectedImage(file);
              }}
              uploadedImage={selectedImage}
            />
            {imagePreview && selectedImage && (
              <div className="mt-4 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
    </div>
  );
};

export default TaskForm;
