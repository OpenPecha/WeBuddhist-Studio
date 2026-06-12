import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Pecha } from "@/components/ui/shadimport";
import { MarkdownEditor } from "@/components/ui/atoms/markdown-editor";
import { IoMdClose } from "react-icons/io";
import { FaMinus, FaTrash } from "react-icons/fa6";
import { FiLoader } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InlineImageUpload from "@/components/ui/molecules/form-upload/InlineImageUpload";
import {
  VideoContent,
  AudioContent,
  ContentIcon,
  SourceReferenceContent,
} from "../content-sub/ContentComponents";
import { getAudioDurationMs, getYouTubeDuration } from "@/lib/utils";
import { AudioTrimmer } from "@/components/ui/molecules/audio-trimmer/AudioTrimmer";
import {
  deleteSubTaskAudio,
  generateDayAudio,
  uploadSubTaskAudio,
} from "@/components/routes/task/api/taskApi";
import TtsGenerateControls from "@/components/ui/molecules/tts-generate-controls/TtsGenerateControls";

interface SubTaskTimestamps {
  start_ms?: number | null;
  end_ms?: number | null;
  audio_url?: string | null;
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
  planLanguage?: string;
  taskId?: string;
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
  <MarkdownEditor
    value={subTask.content}
    onChange={(value) => onUpdate(index, { content: value })}
    placeholder="Enter your text content"
    className="bg-[#FAFAFA] dark:bg-sidebar-secondary"
    textareaClassName="min-h-64 bg-[#FAFAFA] dark:bg-sidebar-secondary"
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

const SubtaskAudioControls = ({
  subTaskId,
  taskId,
  planLanguage = "",
  audioUrl,
}: {
  subTaskId: string;
  taskId?: string;
  planLanguage?: string;
  audioUrl?: string | null;
}) => {
  const queryClient = useQueryClient();
  const { planId } = useParams<{ planId: string }>();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState(audioUrl ?? null);

  useEffect(() => {
    setLocalAudioUrl(audioUrl ?? null);
    setPendingFile(null);
  }, [audioUrl, subTaskId]);

  const revalidateSubtask = async (nextAudioUrl?: string | null) => {
    if (nextAudioUrl !== undefined) {
      setLocalAudioUrl(nextAudioUrl);
    } else if (taskId) {
      await queryClient.refetchQueries({ queryKey: ["taskDetails", taskId] });
      const details = queryClient.getQueryData<{
        subtasks?: Array<{ id: string; audio_url?: string | null }>;
      }>(["taskDetails", taskId]);
      const subtask = details?.subtasks?.find((item) => item.id === subTaskId);
      setLocalAudioUrl(subtask?.audio_url ?? null);
    }
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ["taskDetails", taskId] });
    }
    if (planId) {
      queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
    }
  };

  const generateMutation = useMutation({
    mutationFn: (options: { type?: string; voice_name?: string }) =>
      generateDayAudio(
        { sub_task_id: subTaskId },
        { language: planLanguage, ...options },
      ),
    onSuccess: async () => {
      toast.success("Audio generation Done");
      await revalidateSubtask();
    },
    onError: (error: Error) => {
      toast.error("Failed to generate audio", {
        description: error.message,
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const duration_ms = await getAudioDurationMs(file);
      return uploadSubTaskAudio(subTaskId, file, duration_ms);
    },
    onSuccess: async (data) => {
      setPendingFile(null);
      toast.success("Subtask audio uploaded");
      await revalidateSubtask(data.audio_url);
    },
    onError: (error: Error) => {
      toast.error("Failed to upload subtask audio", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSubTaskAudio(subTaskId),
    onSuccess: async () => {
      setPendingFile(null);
      toast.success("Subtask audio removed");
      await revalidateSubtask(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to remove subtask audio", {
        description: error.message,
      });
    },
  });

  const isBusy =
    generateMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-3 pt-2 border-t border-dashed border-gray-200 dark:border-input">
      <p className="text-sm font-medium">Subtask audio</p>

      {localAudioUrl && (
        <div className="flex items-center gap-2 min-w-0">
          <audio
            controls
            src={localAudioUrl}
            className="h-9 min-w-0 flex-1"
            preload="metadata"
          />
          <Pecha.Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            disabled={isBusy}
            title="Remove audio"
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FaTrash className="w-4 h-4" />
            )}
          </Pecha.Button>
        </div>
      )}

      <TtsGenerateControls
        planLanguage={planLanguage}
        defaultAudioType="INSTRUCTION"
        size="sm"
        isPending={generateMutation.isPending}
        disabled={isBusy}
        onGenerate={(options) => generateMutation.mutate(options)}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#ffffff] dark:bg-[#161616] px-2 text-muted-foreground">
            or upload
          </span>
        </div>
      </div>

      <Dropzone
        accept={{ "audio/*": [".mp3", ".m4a", ".wav", ".aac", ".ogg"] }}
        multiple={false}
        disabled={isBusy}
        onDrop={(files) => {
          if (files[0]) setPendingFile(files[0]);
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="border border-dashed rounded-lg py-2 px-3 text-center text-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 bg-[#FAFAFA] dark:bg-sidebar-secondary"
          >
            <input {...getInputProps()} />
            {pendingFile
              ? `Selected: ${pendingFile.name}`
              : localAudioUrl
                ? "Drop or click to replace subtask audio (MP3, etc.)"
                : "Drop or click to upload subtask audio"}
          </div>
        )}
      </Dropzone>

      {pendingFile && (
        <div className="flex gap-2">
          <Pecha.Button
            type="button"
            variant="default"
            className="bg-[#A51C21] hover:bg-[#A51C21]/90 flex-1"
            disabled={isBusy}
            onClick={() => uploadMutation.mutate(pendingFile)}
          >
            {uploadMutation.isPending && (
              <FiLoader className="w-4 h-4 animate-spin mr-1" />
            )}
            {uploadMutation.isPending ? "Uploading..." : "Upload audio"}
          </Pecha.Button>
          <Pecha.Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => setPendingFile(null)}
          >
            Cancel
          </Pecha.Button>
        </div>
      )}
    </div>
  );
};

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
  planLanguage,
  taskId,
}: SubTaskCardProps) => {
  const showTimestamps =
    dayAudioUrl && dayAudioDurationMs != null && dayAudioDurationMs > 0;

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
      {subTask.id &&
        (subTask.content_type === "TEXT" ||
          subTask.content_type === "SOURCE_REFERENCE") && (
          <SubtaskAudioControls
            subTaskId={subTask.id}
            taskId={taskId}
            planLanguage={planLanguage}
            audioUrl={subTask.audio_url}
          />
        )}
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
