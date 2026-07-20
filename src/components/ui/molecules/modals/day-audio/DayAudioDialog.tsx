import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { AiOutlineSound } from "react-icons/ai";
import DayAudioSection from "@/components/ui/molecules/day-audio-section/DayAudioSection";
import TtsGenerateControls from "@/components/ui/molecules/tts-generate-controls/TtsGenerateControls";
import {
  generateDayAudio,
  waitForAudioJob,
} from "@/components/routes/task/api/taskApi";

interface DayAudioDialogProps {
  planId: string;
  planTitle?: string;
  dayId: string;
  dayNumber: number;
  audioUrl?: string | null;
  audioDurationMs?: number | null;
  hasAudio?: boolean;
  isEditable?: boolean;
  language?: string;
}

const DayAudioDialog = ({
  planId,
  planTitle,
  dayId,
  dayNumber,
  audioUrl,
  audioDurationMs,
  hasAudio,
  isEditable,
  language,
}: DayAudioDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const pollAbortRef = useRef<AbortController | null>(null);

  const abortPolling = () => {
    pollAbortRef.current?.abort();
    pollAbortRef.current = null;
  };

  useEffect(() => abortPolling, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      abortPolling();
    }
  };

  const generateAudioMutation = useMutation({
    mutationFn: async (options: { type?: string; voice_name?: string }) => {
      abortPolling();
      const controller = new AbortController();
      pollAbortRef.current = controller;

      const accepted = await generateDayAudio(
        { day_id: dayId },
        { language: language || "", ...options },
      );
      toast.success("Audio generation started", {
        description: "Your audio will be ready soon.",
      });
      return waitForAudioJob(accepted.job_id, { signal: controller.signal });
    },
    onSuccess: (job) => {
      if (job.status === "failed") {
        toast.error("Failed to generate audio", {
          description: job.error_message || "Something went wrong",
        });
        return;
      }
      toast.success("Audio generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
    },
    onError: (error: any) => {
      if (error?.name === "AbortError") {
        return;
      }
      toast.error("Failed to generate audio", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  return (
    <>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center gap-2 cursor-pointer w-full"
      >
        <AiOutlineSound className="w-4 h-4" /> Narration
      </span>
      <Pecha.Dialog open={open} onOpenChange={handleOpenChange}>
        <Pecha.DialogContent className="sm:max-w-lg">
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Day {dayNumber} Narration</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <DayAudioSection
            planId={planId}
            planTitle={planTitle}
            dayId={dayId}
            dayNumber={dayNumber}
            audioUrl={audioUrl}
            audioDurationMs={audioDurationMs}
            hasAudio={hasAudio}
            isEditable={isEditable}
          />
          {isEditable && (
            <TtsGenerateControls
              planLanguage={language || ""}
              isPending={generateAudioMutation.isPending}
              onGenerate={(options) => generateAudioMutation.mutate(options)}
            />
          )}
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </>
  );
};

export default DayAudioDialog;
