import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { AiOutlineSound } from "react-icons/ai";
import DayAudioSection from "@/components/ui/molecules/day-audio-section/DayAudioSection";
import { generateDayAudio } from "@/components/routes/task/api/taskApi";

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

  const generateAudioMutation = useMutation({
    mutationFn: () => generateDayAudio({ day_id: dayId }, language || ""),
    onSuccess: () => {
      toast.success("Generated audio successfully!");
      queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
    },
    onError: (error: any) => {
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
      <Pecha.Dialog open={open} onOpenChange={setOpen}>
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
            <Pecha.Button
              type="button"
              variant="outline"
              disabled={generateAudioMutation.isPending}
              onClick={() => generateAudioMutation.mutate()}
            >
              {generateAudioMutation.isPending
                ? "Generating..."
                : "Generate Audio"}
            </Pecha.Button>
          )}
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </>
  );
};

export default DayAudioDialog;
