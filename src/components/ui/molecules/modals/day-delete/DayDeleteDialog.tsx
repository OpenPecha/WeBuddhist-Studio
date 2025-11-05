import { useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { FiTrash } from "react-icons/fi";

interface DayDeleteDialogProps {
  dayId: string;
  onDelete: (dayId: string) => void;
}

const DayDeleteDialog = ({ dayId, onDelete }: DayDeleteDialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Pecha.AlertDialog open={open} onOpenChange={setOpen}>
      <Pecha.AlertDialogTrigger asChild>
        <span
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="flex items-center gap-2 cursor-pointer w-full"
        >
          <FiTrash className="w-4 h-4" /> Delete
        </span>
      </Pecha.AlertDialogTrigger>
      <Pecha.AlertDialogContent>
        <Pecha.AlertDialogHeader>
          <Pecha.AlertDialogTitle>Are you sure?</Pecha.AlertDialogTitle>
          <Pecha.AlertDialogDescription>
            This action cannot be undone. This will permanently delete this day
            and its tasks.
          </Pecha.AlertDialogDescription>
        </Pecha.AlertDialogHeader>
        <Pecha.AlertDialogFooter>
          <Pecha.AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </Pecha.AlertDialogCancel>
          <Pecha.AlertDialogAction
            className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
            onClick={() => {
              onDelete(dayId);
              setOpen(false);
            }}
          >
            Delete Day
          </Pecha.AlertDialogAction>
        </Pecha.AlertDialogFooter>
      </Pecha.AlertDialogContent>
    </Pecha.AlertDialog>
  );
};

export default DayDeleteDialog;
