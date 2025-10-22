import { IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { getYouTubeVideoId, extractSpotifyId } from "@/lib/utils";

type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";

export const ContentIcon = ({ type }: { type: ContentType }) => {
  const iconClass = "w-4 h-4 text-gray-600";

  switch (type) {
    case "VIDEO":
      return <IoMdVideocam className={iconClass} />;
    case "TEXT":
      return <IoTextOutline className={iconClass} />;
    case "AUDIO":
      return <IoMusicalNotesSharp className={iconClass} />;
    case "IMAGE":
      return <MdOutlineImage className={iconClass} />;
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
        className="w-full aspect-video rounded-md border"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube preview"
      />
    </div>
  );
};

export const AudioContent = ({ content }: { content: string }) => {
  if (content.includes("spotify.com")) {
    const spotifyData = extractSpotifyId(content);
    if (!spotifyData) return null;

    return (
      <div className="mt-4 w-full rounded-md overflow-hidden">
        <iframe
          src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator`}
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify preview"
          className="w-full h-40 border-0"
        />
      </div>
    );
  }

  if (content.includes("soundcloud.com")) {
    return (
      <div className="mt-4 w-full rounded-md overflow-hidden">
        <iframe
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(content)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
          title="SoundCloud preview"
          className="w-full h-40 border-0"
        />
      </div>
    );
  }

  return null;
};

export const ImageContent = ({ content }: { content: string }) => (
  <div className="mt-4 flex w-full justify-center">
    <div className="relative">
      <img
        src={content}
        alt="Task content"
        className="w-full h-48 object-cover rounded-lg border"
      />
    </div>
  </div>
);

