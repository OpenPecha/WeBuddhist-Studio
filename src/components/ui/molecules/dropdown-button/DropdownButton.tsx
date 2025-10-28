import { Pecha } from "@/components/ui/shadimport";
import { FaPen } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash, IoMdArchive } from "react-icons/io";
import { MdRateReview } from "react-icons/md";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PlanDeleteDialog from "@/components/ui/molecules/modals/plan-delete/PlanDeleteDialog";

export function DropdownButton({ planId }: { planId: string }) {
  const handleDeletePlan = () => {
    //api call
    toast.success("Plan deleted successfully", {
      description: "Your plan has been permanently removed.",
    });
  };

  return (
    <Pecha.ButtonGroup>
      <Pecha.DropdownMenu>
        <Pecha.DropdownMenuTrigger asChild>
          <Pecha.Button variant="outline">
            View <BsThreeDotsVertical />
          </Pecha.Button>
        </Pecha.DropdownMenuTrigger>
        <Pecha.DropdownMenuContent align="end" className="[--radius:1rem]">
          <Pecha.DropdownMenuGroup>
            <Link to={`/plan/${planId}`}>
              <Pecha.DropdownMenuItem>
                <FaPen className="h-4 w-4" />
                Edit Plan
              </Pecha.DropdownMenuItem>
              <Pecha.DropdownMenuSeparator />
            </Link>
            <Pecha.DropdownMenuItem disabled>
              Status
            </Pecha.DropdownMenuItem>
          </Pecha.DropdownMenuGroup>
          <Pecha.DropdownMenuGroup>
            <Pecha.DropdownMenuItem>
              <IoMdArchive className="h-4 w-4" />
              Archive Plan
            </Pecha.DropdownMenuItem>
          </Pecha.DropdownMenuGroup>
          <Pecha.DropdownMenuSeparator />
          <Pecha.DropdownMenuGroup>
            <Pecha.DropdownMenuItem>
              <MdRateReview className="h-4 w-4" />
              Review Plan
            </Pecha.DropdownMenuItem>
          </Pecha.DropdownMenuGroup>
          <Pecha.DropdownMenuSeparator />
          <Pecha.DropdownMenuGroup>
            <PlanDeleteDialog
              planId={planId}
              onDelete={() => handleDeletePlan()}
              trigger={
                <Pecha.DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span className="flex items-center gap-2 w-full">
                    <IoMdTrash className="h-4 w-4" />
                    Delete Plan
                  </span>
                </Pecha.DropdownMenuItem>
              }
            />
          </Pecha.DropdownMenuGroup>
        </Pecha.DropdownMenuContent>
      </Pecha.DropdownMenu>
    </Pecha.ButtonGroup>
  );
}
