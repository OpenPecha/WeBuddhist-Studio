import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoEyeOffSharp } from "react-icons/io5";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  isGroupVisibleInApp,
  pickGroupTitle,
  updateGroupStatus,
  type AuthorGroupDetailDTO,
} from "../api/groupsApi";

type GroupPublishControlProps = {
  group: AuthorGroupDetailDTO;
  variant?: "outline" | "default";
  size?: "sm" | "default";
  className?: string;
};

/** Sends PUBLISHED or UNPUBLISHED only; DRAFT stays the created state. */
const GroupPublishControl = ({
  group,
  variant = "outline",
  size = "sm",
  className,
}: GroupPublishControlProps) => {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPublished = isGroupVisibleInApp(group.status);
  const groupTitle = pickGroupTitle(group.metadata);
  const memberCount = group.member_count ?? group.members?.length ?? 0;

  const statusMutation = useMutation({
    mutationFn: (status: "PUBLISHED" | "UNPUBLISHED") =>
      updateGroupStatus(group.id, status),
    // PATCH returns the full detail DTO, so seed the cache instead of refetching.
    onSuccess: (updated) => {
      queryClient.setQueryData(["cms-group", group.id], updated);
      queryClient.invalidateQueries({ queryKey: ["cms-groups"] });
      setConfirmOpen(false);
      toast.success(
        isGroupVisibleInApp(updated.status)
          ? "Group published — it is now visible in the app"
          : "Group hidden — nothing was deleted",
      );
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleClick = () => {
    if (isPublished) {
      setConfirmOpen(true);
      return;
    }
    statusMutation.mutate("PUBLISHED");
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={statusMutation.isPending}
      >
        {isPublished ? (
          <>
            <IoEyeOffSharp className="w-4 h-4" /> Hide from app
          </>
        ) : (
          <>
            <MdOutlineFileUpload className="w-4 h-4" />
            {statusMutation.isPending ? "Publishing…" : "Publish"}
          </>
        )}
      </Button>

      <Pecha.AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>
              Hide &ldquo;{groupTitle}&rdquo; from the app?
            </Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  The group will disappear from the app for everyone
                  {memberCount > 0 ? (
                    <>
                      , including its {memberCount} existing member
                      {memberCount === 1 ? "" : "s"}
                    </>
                  ) : null}
                  . Its posts, events, chants, accumulations and chat all become
                  unreachable while it is hidden.
                </p>
                <p>
                  Nothing is deleted. Members, content and followers are kept
                  and come back exactly as they are when you publish again.
                </p>
              </div>
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={statusMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              disabled={statusMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                statusMutation.mutate("UNPUBLISHED");
              }}
            >
              {statusMutation.isPending ? "Hiding…" : "Hide group"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </>
  );
};

export default GroupPublishControl;
