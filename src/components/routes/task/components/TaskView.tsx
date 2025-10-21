import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import { IoMdVideocam } from "react-icons/io";
import { IoMusicalNotesSharp, IoTextOutline } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { getYouTubeVideoId, extractSpotifyId } from "@/lib/utils";

interface TaskViewProps {
  taskId: string;
  onClose: () => void;
}

const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

const TaskView = ({ taskId, onClose }: TaskViewProps) => {
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ["taskDetails", taskId],
    queryFn: () => fetchTaskDetails(taskId),
    enabled: !!taskId,
  });

  return (
    <div className="w-full h-full border ">
      <div className=" w-3/4 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Task</h2>
          <Pecha.Button
            variant="outline"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <IoMdClose className="w-4 h-4" />
          </Pecha.Button>
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
            (taskDetails?.subtasks ?? [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((subTask: any) => {
                const contentType = subTask.content_type?.toLowerCase();
                const content = subTask.content ?? "";

                return (
                  <div
                    key={subTask.id}
                    className={`border border-gray-300 ${contentType === "image" ? "w-fit" : ""} dark:border-input rounded-sm p-4 space-y-4`}
                  >
                    <div className="flex items-center gap-2">
                      {contentType === "video" && (
                        <IoMdVideocam className="w-4 h-4 text-gray-600" />
                      )}
                      {contentType === "text" && (
                        <IoTextOutline className="w-4 h-4 text-gray-600" />
                      )}
                      {contentType === "music" && (
                        <IoMusicalNotesSharp className="w-4 h-4 text-gray-600" />
                      )}
                      {contentType === "image" && (
                        <MdOutlineImage className="w-4 h-4 text-gray-600" />
                      )}
                    </div>

                    {contentType === "video" &&
                      content &&
                      (() => {
                        const videoId = getYouTubeVideoId(content);
                        return videoId ? (
                          <div className="mt-4">
                            <iframe
                              className="w-full aspect-video rounded-md border"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="YouTube preview"
                            />
                          </div>
                        ) : null;
                      })()}

                    {contentType === "text" && content && (
                      <div className="w-full min-h-24 whitespace-pre-wrap text-base p-3 border rounded-md">
                        {content}
                      </div>
                    )}

                    {contentType === "music" && content && (
                      <div className="mt-4">
                        {content.includes("spotify.com") &&
                          (() => {
                            const spotifyData = extractSpotifyId(content);
                            return spotifyData ? (
                              <div className="w-full rounded-md overflow-hidden">
                                <iframe
                                  src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}?utm_source=generator`}
                                  allowFullScreen
                                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                  loading="lazy"
                                  title="Spotify preview"
                                  className="w-full h-40 border-0"
                                />
                              </div>
                            ) : null;
                          })()}

                        {content.includes("soundcloud.com") && (
                          <div className="w-full rounded-md overflow-hidden">
                            <iframe
                              allow="autoplay"
                              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(content)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                              title="SoundCloud preview"
                              className="w-full h-40 border-0"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {contentType === "image" && content && (
                      <div className="mt-4 flex w-full justify-center">
                        <div className="relative">
                          <img
                            src={content}
                            alt="Final uploaded image"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
