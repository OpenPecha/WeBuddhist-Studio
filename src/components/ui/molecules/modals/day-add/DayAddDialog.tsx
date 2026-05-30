import { useState } from "react";
import { Pecha } from "@/components/ui/shadimport";
import { IoMdAdd } from "react-icons/io";

interface DayAddDialogProps {
  onAdd: () => void;
  isPending?: boolean;
  disabled?: boolean;
}

const DayAddDialog = ({ onAdd, isPending, disabled }: DayAddDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    onAdd();
    setOpen(false);
  };

  return (
    <Pecha.AlertDialog open={open} onOpenChange={setOpen}>
      <Pecha.AlertDialogTrigger asChild>
        <Pecha.Button
          type="button"
          disabled={disabled || isPending}
          variant="destructive"
          className="cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !isPending) {
              setOpen(true);
            }
          }}
        >
          <IoMdAdd className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPending ? "Adding..." : "Add New Day"}
          </span>
        </Pecha.Button>
      </Pecha.AlertDialogTrigger>
      <Pecha.AlertDialogContent>
        <Pecha.AlertDialogHeader>
          <Pecha.AlertDialogTitle>Add New Day</Pecha.AlertDialogTitle>
          <Pecha.AlertDialogDescription>
            This will create a new day in your plan. You can start adding tasks
            to it right away.
          </Pecha.AlertDialogDescription>
        </Pecha.AlertDialogHeader>
        <Pecha.AlertDialogFooter>
          <Pecha.AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </Pecha.AlertDialogCancel>
          <Pecha.AlertDialogAction
            onClick={handleAdd}
            disabled={isPending}
            className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
          >
            {isPending ? "Adding..." : "Add Day"}
          </Pecha.AlertDialogAction>
        </Pecha.AlertDialogFooter>
      </Pecha.AlertDialogContent>
    </Pecha.AlertDialog>
  );
};

export default DayAddDialog;
