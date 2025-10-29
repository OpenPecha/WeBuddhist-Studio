import { IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { getYouTubeVideoId, extractSpotifyId } from "@/lib/utils";
import pechaIcon from "@/assets/icon/pecha_icon.png";
type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SOURCE_REFERENCE";

export const ContentIcon = ({ type }: { type: ContentType }) => {
  switch (type) {
    case "VIDEO":
      return <IoMdVideocam className="w-4 h-4 text-gray-600" />;
    case "TEXT":
      return <IoTextOutline className="w-4 h-4 text-gray-600" />;
    case "AUDIO":
      return <IoMusicalNotesSharp className="w-4 h-4 text-gray-600" />;
    case "IMAGE":
      return <MdOutlineImage className="w-4 h-4 text-gray-600" />;
    case "SOURCE_REFERENCE":
      return <img src={pechaIcon} alt="Pecha Icon" className="w-4 h-4" />;
    default:
      return null;
  }
};

export const VideoContent = ({ content }: { content: string }) => {
  const videoId = getYouTubeVideoId(content);
  if (!videoId) return null;
  return (
    <div className="mt-4">
      <iframe
        className="w-full aspect-video rounded-md border bg-[#FAFAFA] dark:bg-sidebar-secondary "
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube preview"
      />
    </div>
  );
};

export const AudioContent = ({ content }: { content: string }) => {
  const getEmbedSrc = () => {
    if (content.includes("spotify.com")) {
      const data = extractSpotifyId(content);
      return data
        ? `https://open.spotify.com/embed/${data.type}/${data.id}?utm_source=generator`
        : null;
    }
    if (content.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(content)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    }
    return null;
  };

  const src = getEmbedSrc();
  if (!src) return null;
  return (
    <div className="mt-4 w-full rounded-md overflow-hidden bg-[#FAFAFA] dark:bg-sidebar-secondary ">
      <iframe
        src={src}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-40 border-0"
      />
    </div>
  );
};

export const ImageContent = ({ content }: { content: string }) => (
  <div className="mt-4 flex w-full justify-center bg-[#FAFAFA] dark:bg-sidebar-secondary ">
    <img
      src={content}
      alt="Task content"
      className="w-full h-48 object-cover rounded-lg border"
    />
  </div>
);

export const TextContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-24  bg-[#FAFAFA] dark:bg-sidebar-secondary  whitespace-pre-wrap text-base p-3 border rounded-md">
    {content}
  </div>
);
