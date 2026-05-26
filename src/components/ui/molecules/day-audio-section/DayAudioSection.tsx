import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { FiLoader, FiX } from "react-icons/fi";
import { FaTrash } from "react-icons/fa6";
import { formatMs, getAudioDurationMs } from "@/lib/utils";
import {
  deleteDayAudio,
  uploadDayAudio,
} from "@/components/routes/task/api/planApi";
import { AiOutlineSound } from "react-icons/ai";

interface DayAudioSectionProps {
  planId: string;
  dayId: string;
  dayNumber: number;
  audioUrl?: string | null;
  audioDurationMs?: number | null;
  hasAudio?: boolean;
  isEditable?: boolean;
}

const DayAudioSection = ({
  planId,
  dayId,
  dayNumber,
  audioUrl,
  audioDurationMs,
  hasAudio,
  isEditable = true,
}: DayAudioSectionProps) => {
  const queryClient = useQueryClient();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const showExisting = Boolean(hasAudio && audioUrl);
  const [isExpanded, setIsExpanded] = useState(showExisting);

  useEffect(() => {
    setPendingFile(null);
    setIsExpanded(showExisting);
  }, [dayId, showExisting]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const duration_ms = await getAudioDurationMs(file);
      return uploadDayAudio(dayId, file, duration_ms);
    },
    onSuccess: () => {
      setPendingFile(null);
      toast.success("Day audio uploaded");
      queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to upload day audio", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDayAudio(dayId),
    onSuccess: () => {
      setPendingFile(null);
      setIsExpanded(false);
      toast.success("Day audio removed");
      queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to remove day audio", {
        description: error.message,
      });
    },
  });

  const handleUpload = async () => {
    if (!pendingFile) return;
    uploadMutation.mutate(pendingFile);
  };

  const isBusy = uploadMutation.isPending || deleteMutation.isPending;

  const handleClose = () => {
    setPendingFile(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    if (!isEditable) return null;
    return (
      <div className="mx-4 mb-4">
        <Pecha.Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
        >
          <AiOutlineSound /> Add narration
        </Pecha.Button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 rounded-lg border border-dashed border-gray-300 dark:border-input bg-white dark:bg-[#161616] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Day {dayNumber} narration</h3>
        <div className="flex items-center gap-2 shrink-0">
          {showExisting && audioDurationMs != null && (
            <span className="text-sm text-muted-foreground">
              {formatMs(audioDurationMs)} total
            </span>
          )}
          {!showExisting && isEditable && (
            <Pecha.Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isBusy}
              title="Close"
              onClick={handleClose}
            >
              <FiX className="w-4 h-4" />
            </Pecha.Button>
          )}
        </div>
      </div>

      {showExisting && (
        <div className="flex items-center gap-2 min-w-0">
          <audio
            controls
            src={audioUrl!}
            className="h-9 min-w-0 flex-1"
            preload="metadata"
          />
          {isEditable && (
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
          )}
        </div>
      )}

      {isEditable && (
        <div className="space-y-2">
          <Dropzone
            accept={{ "audio/*": [".mp3", ".m4a", ".wav", ".ogg"] }}
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
                  : showExisting
                    ? "Drop or click to replace day audio (MP3, etc.)"
                    : "Drop or click to upload day narration audio"}
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
                onClick={handleUpload}
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
      )}

      {!showExisting && isEditable && (
        <p className="text-xs text-muted-foreground">
          Upload day narration first, then set subtask timestamps against this
          track.
        </p>
      )}
    </div>
  );
};

export default DayAudioSection;
