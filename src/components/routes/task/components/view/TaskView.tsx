import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import {
  ContentIcon,
  VideoContent,
  AudioContent,
  ImageContent,
} from "../ui/ContentComponents";
import DaySelector from "../ui/DaySelector";

type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";

interface TaskViewProps {
  taskId: string;
  selectedDay: number;
}

const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

const TextContent = ({ content }: { content: string }) => (
  <div className="w-full min-h-24  whitespace-pre-wrap text-base p-3 border rounded-md">
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
  }
};

const SubtaskCard = ({ subtask }: { subtask: any }) => {
  return (
    <div
      className={`border dark:bg-sidebar-secondary bg-[#FAFAFA] border-gray-300 dark:border-input p-4 space-y-4`}
    >
      <div className="flex items-center gap-2">
        <ContentIcon type={subtask.content_type} />
      </div>
      <SubtaskContent type={subtask.content_type} content={subtask.content} />
    </div>
  );
};

const TaskView = ({ taskId, selectedDay }: TaskViewProps) => {
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ["taskDetails", taskId],
    queryFn: () => fetchTaskDetails(taskId),
    enabled: !!taskId,
  });

  return (
    <div className="w-full my-4 h-[calc(100vh-40px)] dark:bg-[#181818] rounded-l-2xl border overflow-y-auto">
      <div className=" space-y-4  overflow-y-auto">
        <div className="flex p-4 items-center justify-between">
          <h2 className="text-xl font-semibold">Task</h2>
          <DaySelector selectedDay={selectedDay} taskId={taskId} />
        </div>
        <div className="p-4">
          <div className="h-12 p-4 w-3/4 text-base flex items-center border">
            {isLoading ? (
              <Pecha.Skeleton className="h-6  w-1/2 rounded" />
            ) : (
              taskDetails?.title
            )}
          </div>
        </div>
        <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
        <div className="space-y-4 w-3/4 p-4 ">
          {taskDetails?.subtasks.length > 0 && (
            <h2 className="text-xl font-semibold">Subtask</h2>
          )}
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
