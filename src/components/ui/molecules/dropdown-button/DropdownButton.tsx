import { Pecha } from "@/components/ui/shadimport";
import { FaPen } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash, IoMdArchive } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoEyeOffSharp } from "react-icons/io5";
import { RiDraftLine } from "react-icons/ri";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PlanDeleteDialog from "@/components/ui/molecules/modals/plan-delete/PlanDeleteDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { STATUS_TRANSITIONS, ALLOWED_TRANSITIONS } from "@/lib/constant";

const STATUS_ICONS = {
  PUBLISHED: MdOutlineFileUpload,
  UNPUBLISHED: IoEyeOffSharp,
  ARCHIVED: IoMdArchive,
  DRAFT: RiDraftLine,
};

export function DropdownButton({
  planId,
  currentStatus,
}: {
  planId: string;
  currentStatus: string;
}) {
  const queryClient = useQueryClient();

  const deletePlanMutation = useMutation({
    mutationFn: async (plan_id: string) => {
      const { data } = await axiosInstance.delete(
        `/api/v1/cms/plans/${plan_id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        },
      );
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      await axiosInstance.patch(
        `/api/v1/cms/plans/${planId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      toast.success(`Status updated to ${newStatus}`);
      queryClient.refetchQueries({ queryKey: ["dashboard-plans"] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail?.message || "Failed to update status",
      );
    }
  };

  const allowedStatuses =
    ALLOWED_TRANSITIONS[currentStatus as keyof typeof ALLOWED_TRANSITIONS] ||
    [];
  const availableTransitions = STATUS_TRANSITIONS.filter((status) =>
    allowedStatuses.includes(status.value),
  );

  const canEdit = currentStatus === "DRAFT" || currentStatus === "ARCHIVED";
  const canDelete = currentStatus === "DRAFT" || currentStatus === "ARCHIVED";

  return (
    <Pecha.ButtonGroup>
      <Pecha.DropdownMenu>
        <Pecha.DropdownMenuTrigger asChild>
          <Pecha.Button variant="outline">
            View <BsThreeDotsVertical />
          </Pecha.Button>
        </Pecha.DropdownMenuTrigger>
        <Pecha.DropdownMenuContent align="end" className="[--radius:1rem]">
          {canEdit && (
            <>
              <Pecha.DropdownMenuGroup>
                <Link to={`/plan/${planId}`}>
                  <Pecha.DropdownMenuItem>
                    <FaPen className="h-4 w-4" />
                    Edit Plan
                  </Pecha.DropdownMenuItem>
                </Link>
              </Pecha.DropdownMenuGroup>
              <Pecha.DropdownMenuSeparator />
            </>
          )}
          <Pecha.DropdownMenuItem disabled>Status</Pecha.DropdownMenuItem>
          <Pecha.DropdownMenuGroup>
            {availableTransitions.map((status) => {
              const IconComponent =
                STATUS_ICONS[status.value as keyof typeof STATUS_ICONS]
              return (
                <Pecha.DropdownMenuItem
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                >
                  <IconComponent className="h-4 w-4" />
                  {status.label}
                </Pecha.DropdownMenuItem>
              );
            })}
          </Pecha.DropdownMenuGroup>
          {canDelete && (
            <>
              <Pecha.DropdownMenuSeparator />
              <Pecha.DropdownMenuGroup>
                <PlanDeleteDialog
                  planId={planId}
                  onDelete={handleDeletePlan}
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
            </>
          )}
        </Pecha.DropdownMenuContent>
      </Pecha.DropdownMenu>
    </Pecha.ButtonGroup>
  );
}