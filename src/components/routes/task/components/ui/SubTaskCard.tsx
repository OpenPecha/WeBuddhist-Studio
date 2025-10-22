import { Pecha } from "@/components/ui/shadimport";
import { IoMdClose } from "react-icons/io";
import { FaMinus } from "react-icons/fa6";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import { VideoContent, AudioContent, ContentIcon } from "./ContentComponents";

interface VideoSubTask {
  contentType: "VIDEO";
  videoUrl: string;
}

interface TextSubTask {
  contentType: "TEXT";
  textContent: string;
}

interface AudioSubTask {
  contentType: "AUDIO";
  musicUrl: string;
}

interface ImageSubTask {
  contentType: "IMAGE";
  imagePreview: string | null;
  imageKey: string | null;
  isUploading: boolean;
}

export type SubTask = VideoSubTask | TextSubTask | AudioSubTask | ImageSubTask;

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
      className="h-12 text-base"
      value={subTask.videoUrl}
      onChange={(e) => onUpdate(index, { videoUrl: e.target.value })}
    />
    <VideoContent content={subTask.videoUrl} />
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
    className="w-full h-24 resize-none text-base"
    value={subTask.textContent}
    onChange={(e) => onUpdate(index, { textContent: e.target.value })}
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
      className="h-12 text-base"
      value={subTask.musicUrl}
      onChange={(e) => onUpdate(index, { musicUrl: e.target.value })}
    />
    {subTask.musicUrl && <AudioContent content={subTask.musicUrl} />}
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
    {!subTask.imagePreview && !subTask.isUploading && (
      <InlineImageUpload
        onUpload={(file) => onImageUpload(index, file)}
        uploadedImage={subTask.imagePreview}
      />
    )}
    {subTask.isUploading && (
      <div className="flex items-center justify-center h-32 border border-dashed border-gray-300 rounded-lg">
        <span className="text-gray-600">Uploading image...</span>
      </div>
    )}
    {subTask.imagePreview && (
      <div className="mt-4 flex w-full justify-center">
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

export const SubTaskCard = ({
  subTask,
  index,
  onUpdate,
  onRemove,
  onImageUpload,
  onRemoveImage,
}: SubTaskCardProps) => {
  const renderContent = () => {
    switch (subTask.contentType) {
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
    }
  };

  return (
    <div
      key={index}
      className={`border border-gray-300 dark:border-input rounded-sm p-4 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ContentIcon type={subTask.contentType} />
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
