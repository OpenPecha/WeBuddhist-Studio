import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import { IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { getYouTubeVideoId, extractSpotifyId } from "@/lib/utils";

type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";

interface TaskViewProps {
  taskId: string;
}

const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

const ContentIcon = ({ type }: { type: ContentType }) => {
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

const VideoContent = ({ content }: { content: string }) => {
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

const TextContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-24 whitespace-pre-wrap text-base p-3 border rounded-md">
    {content}
  </div>
);

const AudioContent = ({ content }: { content: string }) => {
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

const ImageContent = ({ content }: { content: string }) => (
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

const SubtaskContent = ({
  type,
  content,
}: {
  type: ContentType;
  content: string;
}) => {
  if (!content) return null;

  switch (type) {
    case "VIDEO":
      return <VideoContent content={content} />;
    case "TEXT":
      return <TextContent content={content} />;
    case "AUDIO":
      return <AudioContent content={content} />;
    case "IMAGE":
      return <ImageContent content={content} />;
    default:
      return null;
  }
};

const SubtaskCard = ({ subtask }: { subtask: any }) => {
  return (
    <div
      className={`border border-gray-300 dark:border-input rounded-sm p-4 space-y-4`}
    >
      <div className="flex items-center gap-2">
        <ContentIcon type={subtask.content_type} />
      </div>
      <SubtaskContent type={subtask.content_type} content={subtask.content} />
    </div>
  );
};

const TaskView = ({ taskId }: TaskViewProps) => {
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ["taskDetails", taskId],
    queryFn: () => fetchTaskDetails(taskId),
    enabled: !!taskId,
  });

  return (
    <div className="w-full h-full border">
      <div className="w-3/4 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Task</h2>
        </div>

        <div className="h-12 text-base flex items-center px-3 border rounded-md">
          {isLoading ? (
            <Pecha.Skeleton className="h-6 w-1/2 rounded" />
          ) : (
            taskDetails?.title
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <>
              <Pecha.Skeleton className="h-32 w-full rounded" />
              <Pecha.Skeleton className="h-32 w-full rounded" />
            </>
          ) : (
            taskDetails?.subtasks.map((subtask: any) => (
              <SubtaskCard key={subtask.id} subtask={subtask} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
