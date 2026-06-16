import { useState } from "react";
import { IoBookOutline } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/atoms/tooltip";
import VerseOfDayDialog from "./VerseOfDayDialog";

const VerseOfDayButton = () => {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setTooltipOpen(false);
  };

  return (
    <>
      <Tooltip open={open ? false : tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="border p-2 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Verse of Day"
          >
            <IoBookOutline className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Verse of Day</TooltipContent>
      </Tooltip>

      <VerseOfDayDialog open={open} onOpenChange={handleOpenChange} />
    </>
  );
};

export default VerseOfDayButton;
