import { Button } from "@/components/ui/atoms/button";
import { ButtonGroup } from "@/components/ui/atoms/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/atoms/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/atoms/alert-dialog";
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
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <BsThreeDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="[--radius:1rem]">
          <DropdownMenuGroup>
            <Link to={`/plan/${planId}`}>
            <DropdownMenuItem>
              <FaPen className="h-4 w-4" />
              Edit Plan
            </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <IoMdTrash className="h-4 w-4" />
                  Delete Plan
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your plan and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className=" bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
                    onClick={handleDeletePlan}
                  >
                    Delete Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
