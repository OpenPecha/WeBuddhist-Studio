import { Pecha } from "@/components/ui/shadimport";
import { IoMdClose } from "react-icons/io";
import { FaMinus } from "react-icons/fa6";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import { VideoContent, AudioContent, ContentIcon } from "./ContentComponents";

interface VideoSubTask {
  id?: string | null;
  content_type: "VIDEO";
  content: string;
  display_order?: number;
}

interface TextSubTask {
  id?: string | null;
  content_type: "TEXT";
  content: string;
  display_order?: number;
}

interface AudioSubTask {
  id?: string | null;
  content_type: "AUDIO";
  content: string;
  display_order?: number;
}

interface ImageSubTask {
  id?: string | null;
  content_type: "IMAGE";
  content: string | null;
  imagePreview: string | null;
  display_order?: number;
}

interface SourceSubTask {
  id?: string | null;
  content_type: "SOURCE";
  content: string;
  display_order?: number;
}
export type SubTask =
  | VideoSubTask
  | TextSubTask
  | AudioSubTask
  | ImageSubTask
  | SourceSubTask;

interface SubTaskCardProps {
  subTask: SubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
  onRemove: (index: number) => void;
  onImageUpload: (index: number, file: File) => void;
  onRemoveImage: (index: number) => void;
}

const VideoSubtask = ({
  subTask,
  index,
  onUpdate,
}: {
  subTask: VideoSubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
}) => (
  <>
    <Pecha.Input
      type="url"
      placeholder="Enter YouTube URL"
      className="h-12 text-base bg-[#FAFAFA] dark:bg-sidebar-secondary "
      value={subTask.content}
      onChange={(e) => onUpdate(index, { content: e.target.value })}
    />
    <VideoContent content={subTask.content} />
  </>
);

const TextSubtask = ({
  subTask,
  index,
  onUpdate,
}: {
  subTask: TextSubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
}) => (
  <Pecha.Textarea
    placeholder="Enter your text content"
    className="w-full h-24 resize-none text-base bg-[#FAFAFA] dark:bg-sidebar-secondary "
    value={subTask.content}
    onChange={(e) => onUpdate(index, { content: e.target.value })}
  />
);

const AudioSubtask = ({
  subTask,
  index,
  onUpdate,
}: {
  subTask: AudioSubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
}) => (
  <>
    <Pecha.Input
      type="url"
      placeholder="Enter Spotify or SoundCloud URL"
      className="h-12 text-base bg-[#FAFAFA] dark:bg-sidebar-secondary "
      value={subTask.content}
      onChange={(e) => onUpdate(index, { content: e.target.value })}
    />
    {subTask.content && <AudioContent content={subTask.content} />}
  </>
);

const ImageSubtask = ({
  subTask,
  index,
  onImageUpload,
  onRemoveImage,
}: {
  subTask: ImageSubTask;
  index: number;
  onImageUpload: (index: number, file: File) => void;
  onRemoveImage: (index: number) => void;
}) => (
  <>
    {!subTask.imagePreview && (
      <InlineImageUpload
        onUpload={(file) => onImageUpload(index, file)}
        uploadedImage={subTask.imagePreview}
      />
    )}
    {subTask.imagePreview && (
      <div className="mt-4 flex w-full justify-center bg-[#FAFAFA] dark:bg-sidebar-secondary ">
        <div className="relative">
          <img
            src={subTask.imagePreview}
            alt="Final uploaded image"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Pecha.Button
            variant="default"
            className="absolute top-2 right-2"
            type="button"
            onClick={() => onRemoveImage(index)}
            data-testid="remove-image-button"
          >
            <FaMinus className="w-4 h-4" />
          </Pecha.Button>
        </div>
      </div>
    )}
  </>
);

const SourceSubtask = ({ subTask }: { subTask: SourceSubTask }) => (
  <div className="w-full min-h-12 bg-[#FAFAFA] dark:bg-sidebar-secondary whitespace-pre-wrap text-base p-3 border rounded-md">
    {subTask.content}
  </div>
);

export const SubTaskCard = ({
  subTask,
  index,
  onUpdate,
  onRemove,
  onImageUpload,
  onRemoveImage,
}: SubTaskCardProps) => {
  const renderContent = () => {
    switch (subTask.content_type) {
      case "VIDEO":
        return (
          <VideoSubtask subTask={subTask} index={index} onUpdate={onUpdate} />
        );
      case "TEXT":
        return (
          <TextSubtask subTask={subTask} index={index} onUpdate={onUpdate} />
        );
      case "AUDIO":
        return (
          <AudioSubtask subTask={subTask} index={index} onUpdate={onUpdate} />
        );
      case "IMAGE":
        return (
          <ImageSubtask
            subTask={subTask}
            index={index}
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
          />
        );
      case "SOURCE":
        return <SourceSubtask subTask={subTask} />;
    }
  };

  return (
    <div
      key={index}
      className={`border border-gray-300 bg-[#ffffff] dark:bg-[#161616] dark:border-input rounded-sm p-2 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-[#F7F7F7] border dark:bg-sidebar-secondary  px-2 py-1 text-sm rounded-md border-dashed gap-2">
          <ContentIcon type={subTask.content_type} />
          {subTask.content_type}
        </div>
        <Pecha.Button
          variant="outline"
          type="button"
          onClick={() => onRemove(index)}
        >
          <IoMdClose className="w-4 h-4" />
        </Pecha.Button>
      </div>
      {renderContent()}
    </div>
  );
};
