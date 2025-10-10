import { Pecha } from "@/components/ui/shadimport";
import { IoMdTrash } from "react-icons/io";
import { useState } from "react";

interface PlanDeleteDialogProps {
  planId: string;
  onDelete: (planId: string) => void;
  trigger?: React.ReactNode;
}

const PlanDeleteDialog = ({ planId, onDelete, trigger }: PlanDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete(planId);
    setOpen(false);
  };

  return (
    <Pecha.AlertDialog open={open} onOpenChange={setOpen}>
      <Pecha.AlertDialogTrigger asChild>
        {trigger || (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer w-full"
          >
            <IoMdTrash className="w-4 h-4" /> Delete Plan
          </span>
        )}
      </Pecha.AlertDialogTrigger>
      <Pecha.AlertDialogContent>
        <Pecha.AlertDialogHeader>
          <Pecha.AlertDialogTitle>Are you sure?</Pecha.AlertDialogTitle>
          <Pecha.AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            your plan and remove all associated data.
          </Pecha.AlertDialogDescription>
        </Pecha.AlertDialogHeader>
        <Pecha.AlertDialogFooter>
          <Pecha.AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </Pecha.AlertDialogCancel>
          <Pecha.AlertDialogAction
            className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
            onClick={handleDelete}
          >
            Delete Plan
          </Pecha.AlertDialogAction>
        </Pecha.AlertDialogFooter>
      </Pecha.AlertDialogContent>
    </Pecha.AlertDialog>
  );
};

export default PlanDeleteDialog;
