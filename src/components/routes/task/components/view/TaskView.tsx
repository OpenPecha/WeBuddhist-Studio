import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import axiosInstance from "@/config/axios-config";
import {
  ContentIcon,
  VideoContent,
  AudioContent,
  ImageContent,
  TextContent,
  SourceReferenceContent,
} from "../../../../ui/molecules/content-sub/ContentComponents";
import { SortableList, SortableItem } from "@/components/ui/atoms/sortable";
import { PiDotsSixVertical } from "react-icons/pi";
import { useSubtaskReorder } from "../../hooks/useSubtaskReorder";
import { FaPen } from "react-icons/fa";

type ContentType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SOURCE_REFERENCE";

interface TaskViewProps {
  taskId: string;
  onEditTask: (task: any) => void;
  isDraft?: boolean;
}

const fetchTaskDetails = async (task_id: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/tasks/${task_id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

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
    case "SOURCE_REFERENCE":
      return <SourceReferenceContent content={content} />;
  }
};

const SubtaskCard = ({
  subtask,
  listeners,
  isDraft,
}: {
  subtask: any;
  listeners?: any;
  isDraft?: boolean;
}) => {
  return (
    <div
      className={`border rounded-xl bg-[#ffffff] dark:bg-[#161616] border-gray-300 dark:border-input p-2 space-y-2`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center border w-fit bg-[#F7F7F7] dark:bg-sidebar-secondary px-2 py-1 text-sm rounded-md border-dashed gap-2">
          <ContentIcon type={subtask.content_type} /> {subtask.content_type}
        </div>
        {listeners && isDraft && (
          <PiDotsSixVertical
            className="w-5 h-5 text-gray-400 dark:text-muted-foreground cursor-grab active:cursor-grabbing"
            {...listeners}
          />
        )}
      </div>
      <SubtaskContent type={subtask.content_type} content={subtask.content} />
    </div>
  );
};

const TaskView = ({ taskId, onEditTask, isDraft }: TaskViewProps) => {
  const { data: taskDetails, isLoading } = useQuery({
    queryKey: ["taskDetails", taskId],
    queryFn: () => fetchTaskDetails(taskId),
    enabled: !!taskId,
  });

  const { handleSubtaskReorder, getDisplaySubtasks } = useSubtaskReorder(
    taskDetails,
    taskId,
  );

  const displaySubtasks = getDisplaySubtasks();

  return (
    <div className="w-full my-4 h-[calc(100vh-40px)] bg-[#F5F5F5] border-dashed dark:bg-[#181818]  rounded-l-2xl border overflow-y-auto">
      <div className=" space-y-4  overflow-y-auto">
        <div className="flex p-4 items-center justify-between w-3/4">
          <h2 className="text-xl font-semibold">Task</h2>
          {isDraft && (
            <Pecha.Button
              variant="outline"
              type="button"
              onClick={() => onEditTask(taskDetails)}
            >
              <FaPen className="h-4 w-4" />
              Edit
            </Pecha.Button>
          )}
        </div>
        <div className="p-4">
          <div className="h-12 p-4 bg-white dark:bg-input/30 rounded-md lg:w-2/3 w-full text-base flex items-center border">
            {isLoading ? (
              <Pecha.Skeleton className="h-6  w-1/2 rounded" />
            ) : (
              taskDetails?.title
            )}
          </div>
        </div>
        <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
        <div className="space-y-4 w-full lg:w-2/3 p-4 ">
          {taskDetails?.subtasks.length > 0 && (
            <h2 className="text-xl font-semibold">Subtask</h2>
          )}
          {isLoading ? (
            <>
              <Pecha.Skeleton className="h-32 w-full rounded" />
              <Pecha.Skeleton className="h-32 w-full rounded" />
            </>
          ) : (
            <SortableList
              items={displaySubtasks.map((subtask: any) => ({
                id: subtask.id,
                display_order: subtask.display_order,
              }))}
              onReorder={(activeId: any, overId: any) => {
                handleSubtaskReorder(activeId, overId);
              }}
              disabled={!isDraft}
            >
              {displaySubtasks.map((subtask: any) => (
                <SortableItem key={subtask.id} id={subtask.id}>
                  {({ listeners }: any) => (
                    <SubtaskCard
                      subtask={subtask}
                      listeners={listeners}
                      isDraft={isDraft}
                    />
                  )}
                </SortableItem>
              ))}
            </SortableList>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
