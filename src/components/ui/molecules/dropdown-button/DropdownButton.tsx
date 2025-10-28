import { Pecha } from "@/components/ui/shadimport";
import { FaPen } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PlanDeleteDialog from "@/components/ui/molecules/modals/plan-delete/PlanDeleteDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";

export function DropdownButton({ planId }: { planId: string }) {
  const queryClient = useQueryClient();
  const deletePlanMutation = useMutation({
    mutationFn: async (plan_id: string) => {
      const { data } = await axiosInstance.delete(`/api/v1/cms/plans/${plan_id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Plan deleted successfully!", {
        description: "The plan has been deleted.",
      });
      queryClient.refetchQueries({ queryKey: ["dashboard-plans"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete plan", {
        description: error.response.data.detail.message,
      });
    },
  });

  const handleDeletePlan = () => {
    deletePlanMutation.mutate(planId);
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
            </Link>
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
