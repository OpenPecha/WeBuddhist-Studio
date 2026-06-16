import { IoBookOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/atoms/tooltip";
import { ROUTES } from "@/routes/paths";

const VerseOfDayButton = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={ROUTES.verseOfDay}
          className="border p-2 rounded-md text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Verse of Day"
        >
          <IoBookOutline className="w-4 h-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">Verse of Day</TooltipContent>
    </Tooltip>
  );
};

export default VerseOfDayButton;
