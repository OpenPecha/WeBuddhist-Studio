import { useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { MdImage } from "react-icons/md";
import DayShareableImageUpload from "@/components/ui/molecules/day-shareable-images/DayShareableImageUpload";

interface DayShareableImagesDialogProps {
  planId: string;
  dayId: string;
  dayNumber: number;
  thumbnailUrl?: string | null;
  shareableImageUrl?: string | null;
  isEditable?: boolean;
}

const DayShareableImagesDialog = ({
  planId,
  dayId,
  dayNumber,
  thumbnailUrl,
  shareableImageUrl,
  isEditable,
}: DayShareableImagesDialogProps) => {
  const [open, setOpen] = useState(false);
  const imageCount = [thumbnailUrl, shareableImageUrl].filter(Boolean).length;

  return (
    <>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center gap-2 cursor-pointer w-full"
      >
        <MdImage className="w-4 h-4" /> Shareable images
        {imageCount > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {imageCount}/2
          </span>
        )}
      </span>

      <Pecha.Dialog open={open} onOpenChange={setOpen}>
        <Pecha.DialogContent className="sm:max-w-lg">
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>
              Day {dayNumber} shareable images
            </Pecha.DialogTitle>
          </Pecha.DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <DayShareableImageUpload
              planId={planId}
              dayId={dayId}
              imageType="thumbnail"
              label="Thumbnail"
              imageUrl={thumbnailUrl}
              isEditable={isEditable}
            />
            <DayShareableImageUpload
              planId={planId}
              dayId={dayId}
              imageType="shareable_image"
              label="Shareable image"
              imageUrl={shareableImageUrl}
              isEditable={isEditable}
            />
          </div>
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </>
  );
};

export default DayShareableImagesDialog;
