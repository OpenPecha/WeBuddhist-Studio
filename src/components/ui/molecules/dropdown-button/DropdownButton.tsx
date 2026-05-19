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

export type DropdownButtonEntityType = "plan" | "series";

export function DropdownButton({
  planId,
  currentStatus,
  triggerVariant = "default",
  triggerClassName,
  entityType = "plan",
}: {
  planId: string;
  currentStatus: string;
  triggerVariant?: "default" | "icon";
  triggerClassName?: string;
  entityType?: DropdownButtonEntityType;
}) {
  const queryClient = useQueryClient();
  const isSeries = entityType === "series";
  const apiBase = isSeries ? "/api/v1/cms/series" : "/api/v1/cms/plans";
  const editHref = isSeries ? `/series/${planId}` : `/plan/${planId}`;
  const editLabel = isSeries ? "Edit Series" : "Edit Plan";
  const deleteLabel = isSeries ? "Delete Series" : "Delete Plan";
  const entityName = isSeries ? "Series" : "Plan";

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`${apiBase}/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      toast.success(`${entityName} deleted successfully!`, {
        description: `The ${entityName.toLowerCase()} has been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
    },
    onError: (error: {
      response?: { data?: { detail?: { message?: string } } };
    }) => {
      toast.error(`Failed to delete ${entityName.toLowerCase()}`, {
        description: error.response?.data?.detail?.message,
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(planId);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      await axiosInstance.patch(
        `${apiBase}/${planId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
      if (!isSeries) {
        queryClient.invalidateQueries({ queryKey: ["planDetails", planId] });
      }
    } catch (error: {
      response?: { data?: { detail?: { message?: string } } };
    }) {
      toast.error(
        error.response?.data?.detail?.message ?? "Status update failed",
      );
    }
  };

  const allowedStatuses =
    ALLOWED_TRANSITIONS[currentStatus as keyof typeof ALLOWED_TRANSITIONS];
  const availableTransitions = STATUS_TRANSITIONS.filter((status) =>
    allowedStatuses.includes(status.value),
  );

  const canEdit = currentStatus === "DRAFT" || currentStatus === "ARCHIVED";
  const canDelete = currentStatus === "DRAFT" || currentStatus === "ARCHIVED";

  return (
    <Pecha.ButtonGroup>
      <Pecha.DropdownMenu>
        <Pecha.DropdownMenuTrigger asChild>
          {triggerVariant === "icon" ? (
            <Pecha.Button
              variant="outline"
              size="icon"
              className={triggerClassName}
              aria-label={`${entityName} actions`}
            >
              <BsThreeDotsVertical className="h-4 w-4" />
            </Pecha.Button>
          ) : (
            <Pecha.Button variant="outline">
              Status <BsThreeDotsVertical />
            </Pecha.Button>
          )}
        </Pecha.DropdownMenuTrigger>
        <Pecha.DropdownMenuContent align="end" className="[--radius:1rem]">
          {canEdit && (
            <>
              <Pecha.DropdownMenuGroup>
                <Link to={editHref}>
                  <Pecha.DropdownMenuItem>
                    <FaPen className="h-4 w-4" />
                    {editLabel}
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
                STATUS_ICONS[status.value as keyof typeof STATUS_ICONS];
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
                  entityLabel={entityName}
                  onDelete={handleDelete}
                  trigger={
                    <Pecha.DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <span className="flex w-full items-center gap-2">
                        <IoMdTrash className="h-4 w-4" />
                        {deleteLabel}
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
