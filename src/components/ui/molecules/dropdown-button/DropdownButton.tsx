import { Pecha } from "@/components/ui/shadimport";
import { IoMdTrash } from "react-icons/io";
import { FaPen } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function DropdownButton({ planId }: { planId: string }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const handleDeletePlan = () => {
    //api call
    toast.success("Plan deleted successfully", {
      description: "Your plan has been permanently removed.",
    });

    setIsDeleteDialogOpen(false);
  };

  return (
    <Pecha.ButtonGroup>
      <Pecha.DropdownMenu>
        <Pecha.DropdownMenuTrigger asChild>
          <Pecha.Button variant="outline">
            <BsThreeDots className="h-4 w-4" />
          </Pecha.Button>
        </Pecha.DropdownMenuTrigger>
        <Pecha.DropdownMenuContent align="end" className="[--radius:1rem]">
          <Pecha.DropdownMenuGroup>
            <Link to={`/plan/${planId}`}>
            <Pecha.DropdownMenuItem>
              <FaPen className="h-4 w-4" />
              Edit Plan
            </Pecha.DropdownMenuItem>
            </Link>
          </Pecha.DropdownMenuGroup>
          <Pecha.DropdownMenuSeparator />
          <Pecha.DropdownMenuGroup>
            <Pecha.AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <Pecha.AlertDialogTrigger asChild>
                <Pecha.DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <IoMdTrash className="h-4 w-4" />
                  Delete Plan
                </Pecha.DropdownMenuItem>
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
                  <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
                  <Pecha.AlertDialogAction
                    className=" bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
                    onClick={handleDeletePlan}
                  >
                    Delete Plan
                  </Pecha.AlertDialogAction>
                </Pecha.AlertDialogFooter>
              </Pecha.AlertDialogContent>
            </Pecha.AlertDialog>
          </Pecha.DropdownMenuGroup>
        </Pecha.DropdownMenuContent>
      </Pecha.DropdownMenu>
    </Pecha.ButtonGroup>
  );
}
