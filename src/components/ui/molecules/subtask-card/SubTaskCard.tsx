import { Pecha } from "@/components/ui/shadimport";
import { IoMdClose } from "react-icons/io";
import { FaMinus } from "react-icons/fa6";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import {
  VideoContent,
  AudioContent,
  ContentIcon,
  SourceReferenceContent,
} from "../content-sub/ContentComponents";
import { getYouTubeDuration } from "@/lib/utils";
import { AudioTrimmer } from "@/components/ui/molecules/audio-trimmer/AudioTrimmer";

interface SubTaskTimestamps {
  start_ms?: number | null;
  end_ms?: number | null;
}

interface VideoSubTask extends SubTaskTimestamps {
  id?: string | null;
  content_type: "VIDEO";
  content: string;
  display_order?: number;
  duration?: string;
}

interface TextSubTask extends SubTaskTimestamps {
  id?: string | null;
  content_type: "TEXT";
  content: string;
  display_order?: number;
}

interface AudioSubTask extends SubTaskTimestamps {
  id?: string | null;
  content_type: "AUDIO";
  content: string;
  display_order?: number;
}

interface ImageSubTask extends SubTaskTimestamps {
  id?: string | null;
  content_type: "IMAGE";
  content: string | null;
  imagePreview: string | null;
  display_order?: number;
}

interface SourceSubTask extends SubTaskTimestamps {
  id?: string | null;
  content_type: "SOURCE_REFERENCE";
  content: string;
  display_order?: number;
  source_text_id?: string | null;
  pecha_segment_id?: string | null;
  segment_ids?: string[] | null;
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
  onImageUpload: (index: number, file: File) => Promise<void> | void;
  onRemoveImage: (index: number) => void;
  dayAudioUrl?: string | null;
  dayAudioDurationMs?: number | null;
}

const VideoSubtask = ({
  subTask,
  index,
  onUpdate,
}: {
  subTask: VideoSubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
}) => {
  const handleUrlChange = async (url: string) => {
    onUpdate(index, { content: url, duration: "" });

    // Fetch duration if it's a valid YouTube URL
    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      try {
        const duration = await getYouTubeDuration(url);
        onUpdate(index, { content: url, duration });
      } catch (error) {
        console.error("Failed to fetch duration:", error);
        onUpdate(index, { content: url, duration: "" });
      }
    }
  };

  return (
    <>
      <Pecha.Input
        type="url"
        placeholder="Enter YouTube URL"
        className="h-12 text-base bg-[#FAFAFA] dark:bg-sidebar-secondary "
        value={subTask.content}
        onChange={(e) => handleUrlChange(e.target.value)}
      />

      <VideoContent content={subTask.content} />
    </>
  );
};

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
    className="w-full min-h-64 resize-none text-base bg-[#FAFAFA] dark:bg-sidebar-secondary "
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
      <InlineImageUpload onUpload={(file) => onImageUpload(index, file)} />
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
  <SourceReferenceContent content={subTask.content} />
);

const SubtaskTimestampSection = ({
  subTask,
  index,
  onUpdate,
  dayAudioUrl,
  dayAudioDurationMs,
}: {
  subTask: SubTask;
  index: number;
  onUpdate: (index: number, updates: Partial<SubTask>) => void;
  dayAudioUrl: string;
  dayAudioDurationMs: number;
}) => (
  <div className="space-y-2 pt-2 border-t border-dashed border-gray-200 dark:border-input">
    <p className="text-sm font-medium">Timeline (day audio)</p>
    <AudioTrimmer
      audioUrl={dayAudioUrl}
      maxDurationMs={dayAudioDurationMs}
      startMs={subTask.start_ms ?? null}
      endMs={subTask.end_ms ?? null}
      onChange={(start_ms, end_ms) => onUpdate(index, { start_ms, end_ms })}
    />
  </div>
);

export const SubTaskCard = ({
  subTask,
  index,
  onUpdate,
  onRemove,
  onImageUpload,
  onRemoveImage,
  dayAudioUrl,
  dayAudioDurationMs,
}: SubTaskCardProps) => {
  const showTimestamps =
    dayAudioUrl &&
    dayAudioDurationMs != null &&
    dayAudioDurationMs > 0;

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
      case "SOURCE_REFERENCE":
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
      {showTimestamps && (
        <SubtaskTimestampSection
          subTask={subTask}
          index={index}
          onUpdate={onUpdate}
          dayAudioUrl={dayAudioUrl}
          dayAudioDurationMs={dayAudioDurationMs}
        />
      )}
    </div>
  );
};
