import { Pecha } from "@/components/ui/shadimport";
import { FaPen } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash, IoMdArchive } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoEyeOffSharp } from "react-icons/io5";
import { RiDraftLine } from "react-icons/ri";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import PlanDeleteDialog from "@/components/ui/molecules/modals/plan-delete/PlanDeleteDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { STATUS_TRANSITIONS, ALLOWED_TRANSITIONS } from "@/lib/constant";
import { normalizeStatus } from "@/components/routes/dashboard/dashboardTable";

export type DropdownAdditionalMenuItem = {
  label: string;
  onClick: () => void;
};

const STATUS_ICONS = {
  PUBLISHED: MdOutlineFileUpload,
  UNPUBLISHED: IoEyeOffSharp,
  ARCHIVED: IoMdArchive,
  DRAFT: RiDraftLine,
};

export type DropdownButtonEntityType = "plan" | "series";

export function DropdownButton({
  id,
  currentStatus,
  triggerVariant = "default",
  triggerClassName,
  entityType = "plan",
  additionalMenuItems,
  invalidateSeriesId,
}: {
  id: string;
  currentStatus: string;
  triggerVariant?: "default" | "icon";
  triggerClassName?: string;
  entityType?: DropdownButtonEntityType;
  additionalMenuItems?: DropdownAdditionalMenuItem[];
  /** When plan actions run on series details, refresh that series query too. */
  invalidateSeriesId?: string;
}) {
  const queryClient = useQueryClient();
  const isSeries = entityType === "series";
  const apiBase = isSeries ? "/api/v1/cms/series" : "/api/v1/cms/plans";
  const editHref = isSeries ? ROUTES.seriesEdit(id) : ROUTES.planEdit(id);
  const editLabel = isSeries ? "Edit Series" : "Edit Plan";
  const deleteLabel = isSeries ? "Delete Series" : "Delete Plan";
  const entityName = isSeries ? "Series" : "Plan";

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`${apiBase}/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success(`${entityName} deleted successfully!`, {
        description: `The ${entityName.toLowerCase()} has been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
      if (invalidateSeriesId) {
        queryClient.invalidateQueries({
          queryKey: ["series", invalidateSeriesId],
        });
      }
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
    deleteMutation.mutate(id);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axiosInstance.patch(`${apiBase}/${id}/status`, {
        status: newStatus,
      });

      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
      if (isSeries) {
        queryClient.invalidateQueries({ queryKey: ["series", id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["planDetails", id] });
        if (invalidateSeriesId) {
          queryClient.invalidateQueries({
            queryKey: ["series", invalidateSeriesId],
          });
        }
      }
    } catch (error: unknown) {
      const message = (
        error as { response?: { data?: { detail?: { message?: string } } } }
      )?.response?.data?.detail?.message;
      toast.error(message ?? "Status update failed");
    }
  };

  const status = normalizeStatus(
    currentStatus,
  ) as keyof typeof ALLOWED_TRANSITIONS;
  const allowedStatuses = ALLOWED_TRANSITIONS[status] ?? [];
  const availableTransitions = STATUS_TRANSITIONS.filter((statusOption) =>
    allowedStatuses.includes(statusOption.value),
  );

  const canEditDelete = status === "DRAFT" || status === "ARCHIVED";
  const extraItems = additionalMenuItems ?? [];

  return (
    <Pecha.ButtonGroup className="mx-auto">
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
          {canEditDelete && (
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
          {extraItems.length > 0 && (
            <>
              <Pecha.DropdownMenuSeparator />
              <Pecha.DropdownMenuGroup>
                {extraItems.map((item) => (
                  <Pecha.DropdownMenuItem
                    key={item.label}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </Pecha.DropdownMenuItem>
                ))}
              </Pecha.DropdownMenuGroup>
            </>
          )}
          {canEditDelete && (
            <>
              <Pecha.DropdownMenuSeparator />
              <Pecha.DropdownMenuGroup>
                <PlanDeleteDialog
                  id={id}
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
