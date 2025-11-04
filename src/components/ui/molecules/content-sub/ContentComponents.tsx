import { IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import {
  getYouTubeVideoId,
  getYouTubeShortsId,
  extractSpotifyId,
} from "@/lib/utils";
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
  const regularVideoId = getYouTubeVideoId(content);
  const shortsVideoId = getYouTubeShortsId(content);

  if (regularVideoId && !shortsVideoId) {
    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Please upload only YouTube short
        </p>
      </div>
    );
  }

  const videoId = shortsVideoId;

  if (!videoId) return null;

  return (
    <div className="mt-4">
      <iframe
        className="w-full max-w-[315px] aspect-[9/16] mx-auto rounded-md border bg-[#FAFAFA] dark:bg-sidebar-secondary"
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
  <div className="mt-4 flex mx-auto justify-center bg-[#FAFAFA] dark:bg-sidebar-secondary ">
    <div>
      <img
        src={content}
        alt="Task content"
        className="w-full h-48 object-cover rounded-lg border"
      />
    </div>
  </div>
);

export const TextContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-24 max-h-56 overflow-y-auto bg-[#FAFAFA] dark:bg-sidebar-secondary  whitespace-pre-wrap text-base p-3 border rounded-md">
    {content}
  </div>
);

export const SourceReferenceContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-12 bg-[#FAFAFA] dark:bg-sidebar-secondary whitespace-pre-wrap text-base p-3 border rounded-md border-dashed border-gray-300 dark:border-[#313132]">
    <div dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);
