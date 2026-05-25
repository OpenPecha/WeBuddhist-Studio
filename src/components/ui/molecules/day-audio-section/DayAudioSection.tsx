import { useState } from "react";
import Dropzone from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { FiLoader } from "react-icons/fi";
import { FaTrash } from "react-icons/fa6";
import { formatMs, getAudioDurationMs } from "@/lib/utils";
import {
  deleteDayAudio,
  uploadDayAudio,
} from "@/components/routes/task/api/planApi";

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
  const showExisting = Boolean(hasAudio && audioUrl);

  return (
    <div className="mx-4 mb-4 rounded-lg border border-dashed border-gray-300 dark:border-input bg-white dark:bg-[#161616] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Day {dayNumber} narration</h3>
        {showExisting && audioDurationMs != null && (
          <span className="text-sm text-muted-foreground">
            {formatMs(audioDurationMs)} total
          </span>
        )}
      </div>

      {showExisting && (
        <div className="space-y-2">
          <audio
            controls
            src={audioUrl!}
            className="w-full"
            preload="metadata"
          />
          {isEditable && (
            <Pecha.Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? (
                <FiLoader className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <FaTrash className="w-4 h-4 mr-1" />
              )}
              Remove audio
            </Pecha.Button>
          )}
        </div>
      )}

      {isEditable && (
        <div className="space-y-3">
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
                className="border border-dashed rounded-lg p-4 text-center text-sm cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 bg-[#FAFAFA] dark:bg-sidebar-secondary"
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

      {!showExisting && !isEditable && (
        <p className="text-sm text-muted-foreground">No day audio uploaded.</p>
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
