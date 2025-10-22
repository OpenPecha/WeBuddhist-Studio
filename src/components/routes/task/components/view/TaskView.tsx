import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import {
  ContentIcon,
  VideoContent,
  AudioContent,
  ImageContent,
} from "../ui/ContentComponents";

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

const TextContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-24 whitespace-pre-wrap text-base p-3 border rounded-md">
    {content}
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
