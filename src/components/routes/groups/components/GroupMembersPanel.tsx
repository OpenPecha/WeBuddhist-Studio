import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { ROUTES } from "@/routes/paths";
import {
  removeGroupMember,
  updateGroupMemberRole,
  type AuthorGroupMemberDTO,
  type AuthorGroupMemberRole,
} from "../api/groupsApi";
import {
  canManageGroupInvites,
  canShowMemberRemovalAction,
  getEffectiveGroupRole,
  isCurrentGroupMember,
  normalizeMemberRole,
  roleChangeOptions,
} from "../lib/groupPermissions";
import GroupInvitesAdminSection from "./GroupInvitesAdminSection";
import { GroupSectionHeader } from "./GroupSection";

type GroupMembersPanelProps = {
  groupId: string;
  members: AuthorGroupMemberDTO[];
};

const GroupMembersPanel = ({ groupId, members }: GroupMembersPanelProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userInfo } = useUserInfo();
  const actor = userInfo
    ? {
        id: userInfo.id,
        email: userInfo.email,
        is_admin: userInfo.is_admin,
      }
    : undefined;
  const myRole = getEffectiveGroupRole(members, actor);
  const [removeTarget, setRemoveTarget] = useState<AuthorGroupMemberDTO | null>(
    null,
  );

  const leavingSelf =
    removeTarget != null && isCurrentGroupMember(removeTarget, actor);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-group", groupId] });
  };

  const roleMutation = useMutation({
    mutationFn: ({
      authorId,
      role,
    }: {
      authorId: string;
      role: AuthorGroupMemberRole;
    }) => updateGroupMemberRole(groupId, authorId, { role }),
    onSuccess: () => {
      toast.success("Member role updated");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: ({ authorId }: { authorId: string; isSelf: boolean }) =>
      removeGroupMember(groupId, authorId),
    onSuccess: (_data, { isSelf }) => {
      setRemoveTarget(null);
      if (isSelf) {
        toast.success("You left the group");
        queryClient.invalidateQueries({ queryKey: ["cms-groups"] });
        navigate(ROUTES.groups);
        return;
      }
      toast.success("Member removed");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <GroupSectionHeader title={`Members (${members.length})`} />

        <div className="overflow-x-auto">
          <Pecha.Table>
            <Pecha.TableHeader>
              <Pecha.TableRow>
                <Pecha.TableHead>Name</Pecha.TableHead>
                <Pecha.TableHead>Email</Pecha.TableHead>
                <Pecha.TableHead>Role</Pecha.TableHead>
                <Pecha.TableHead className="text-right">
                  Actions
                </Pecha.TableHead>
              </Pecha.TableRow>
            </Pecha.TableHeader>
            <Pecha.TableBody>
              {members.map((member) => {
                const isSelf = isCurrentGroupMember(member, actor);
                const displayRole = normalizeMemberRole(member.role);
                const assignableRoles = roleChangeOptions(
                  myRole,
                  member,
                  actor,
                );
                const showRemoval = canShowMemberRemovalAction(
                  members,
                  myRole,
                  member,
                  actor,
                );

                return (
                  <Pecha.TableRow key={member.author_id}>
                    <Pecha.TableCell>
                      {member.firstname} {member.lastname}
                    </Pecha.TableCell>
                    <Pecha.TableCell className="text-muted-foreground">
                      {member.email}
                    </Pecha.TableCell>
                    <Pecha.TableCell>
                      {assignableRoles ? (
                        <Pecha.Select
                          value={displayRole}
                          onValueChange={(role) =>
                            roleMutation.mutate({
                              authorId: member.author_id,
                              role: role as AuthorGroupMemberRole,
                            })
                          }
                          disabled={roleMutation.isPending}
                        >
                          <Pecha.SelectTrigger className="w-32 h-8">
                            <Pecha.SelectValue />
                          </Pecha.SelectTrigger>
                          <Pecha.SelectContent>
                            {assignableRoles.map((role) => (
                              <Pecha.SelectItem key={role} value={role}>
                                {role}
                              </Pecha.SelectItem>
                            ))}
                          </Pecha.SelectContent>
                        </Pecha.Select>
                      ) : (
                        <span className="text-sm">{displayRole}</span>
                      )}
                    </Pecha.TableCell>
                    <Pecha.TableCell className="text-right">
                      {showRemoval && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setRemoveTarget(member)}
                        >
                          {isSelf ? "Leave" : "Remove"}
                        </Button>
                      )}
                    </Pecha.TableCell>
                  </Pecha.TableRow>
                );
              })}
            </Pecha.TableBody>
          </Pecha.Table>
        </div>
      </div>

      {canManageGroupInvites(myRole) && (
        <GroupInvitesAdminSection groupId={groupId} myRole={myRole} />
      )}

      <Pecha.AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>
              {leavingSelf ? "Leave group?" : "Remove member?"}
            </Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              {leavingSelf
                ? "You will lose access to this group. You can rejoin only if invited again."
                : `Remove ${removeTarget?.firstname} ${removeTarget?.lastname} from this group?`}
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={removeMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
              disabled={removeMutation.isPending}
              onClick={() =>
                removeTarget &&
                removeMutation.mutate({
                  authorId: removeTarget.author_id,
                  isSelf: leavingSelf,
                })
              }
            >
              {removeMutation.isPending
                ? leavingSelf
                  ? "Leaving…"
                  : "Removing…"
                : leavingSelf
                  ? "Leave"
                  : "Remove"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupMembersPanel;
