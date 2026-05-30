import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  createGroupInvite,
  removeGroupMember,
  updateGroupMemberRole,
  type AuthorGroupMemberDTO,
  type AuthorGroupMemberRole,
} from "../api/groupsApi";
import { GroupSectionHeader } from "./GroupSection";
const MEMBER_ROLES: AuthorGroupMemberRole[] = [
  "OWNER",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "VIEWER",
];

const INVITE_ROLES: AuthorGroupMemberRole[] = [
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "VIEWER",
];

type GroupMembersPanelProps = {
  groupId: string;
  members: AuthorGroupMemberDTO[];
};

const GroupMembersPanel = ({ groupId, members }: GroupMembersPanelProps) => {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AuthorGroupMemberRole>("AUTHOR");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AuthorGroupMemberDTO | null>(
    null,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-group", groupId] });
  };

  const inviteMutation = useMutation({
    mutationFn: () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      return createGroupInvite(groupId, {
        target_email: targetEmail.trim(),
        role: inviteRole,
        expires_at: expiresAt.toISOString(),
        max_uses: 1,
      });
    },
    onSuccess: (data) => {
      setCreatedToken(data.token);
      toast.success("Invite created");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

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
    mutationFn: (authorId: string) => removeGroupMember(groupId, authorId),
    onSuccess: () => {
      toast.success("Member removed");
      setRemoveTarget(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleCopyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success("Invite token copied");
    } catch {
      toast.error("Could not copy token");
    }
  };

  const resetInviteDialog = () => {
    setInviteOpen(false);
    setTargetEmail("");
    setInviteRole("AUTHOR");
    setCreatedToken(null);
  };

  return (
    <div className="space-y-4">
      <GroupSectionHeader
        title={`Members (${members.length})`}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInviteOpen(true)}
          >
            Invite member
          </Button>
        }
      />

      <div className="overflow-x-auto">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Name</Pecha.TableHead>
              <Pecha.TableHead>Email</Pecha.TableHead>
              <Pecha.TableHead>Role</Pecha.TableHead>
              <Pecha.TableHead className="text-right">Actions</Pecha.TableHead>
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>
            {members.map((member) => (
              <Pecha.TableRow key={member.author_id}>
                <Pecha.TableCell>
                  {member.firstname} {member.lastname}
                </Pecha.TableCell>
                <Pecha.TableCell className="text-muted-foreground">
                  {member.email}
                </Pecha.TableCell>
                <Pecha.TableCell>
                  <Pecha.Select
                    value={member.role}
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
                      {MEMBER_ROLES.map((role) => (
                        <Pecha.SelectItem key={role} value={role}>
                          {role}
                        </Pecha.SelectItem>
                      ))}
                    </Pecha.SelectContent>
                  </Pecha.Select>
                </Pecha.TableCell>
                <Pecha.TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setRemoveTarget(member)}
                    disabled={
                      member.role === "OWNER" &&
                      members.filter((m) => m.role === "OWNER").length <= 1
                    }
                  >
                    Remove
                  </Button>
                </Pecha.TableCell>
              </Pecha.TableRow>
            ))}
          </Pecha.TableBody>
        </Pecha.Table>
      </div>

      <Pecha.Dialog
        open={inviteOpen}
        onOpenChange={(open) => !open && resetInviteDialog()}
      >
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>
              {createdToken ? "Invite created" : "Invite member"}
            </Pecha.DialogTitle>
          </Pecha.DialogHeader>

          {createdToken ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy this token now — it is only shown once. Share it with{" "}
                <strong>{targetEmail}</strong> to accept the invite.
              </p>
              <Pecha.Input
                value={createdToken}
                readOnly
                className="font-mono text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyToken}
                >
                  Copy token
                </Button>
                <Button type="button" onClick={resetInviteDialog}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Pecha.Input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="author@example.org"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Pecha.Select
                  value={inviteRole}
                  onValueChange={(v) =>
                    setInviteRole(v as AuthorGroupMemberRole)
                  }
                >
                  <Pecha.SelectTrigger>
                    <Pecha.SelectValue />
                  </Pecha.SelectTrigger>
                  <Pecha.SelectContent>
                    {INVITE_ROLES.map((role) => (
                      <Pecha.SelectItem key={role} value={role}>
                        {role}
                      </Pecha.SelectItem>
                    ))}
                  </Pecha.SelectContent>
                </Pecha.Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetInviteDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!targetEmail.trim() || inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate()}
                >
                  {inviteMutation.isPending ? "Creating…" : "Create invite"}
                </Button>
              </div>
            </div>
          )}
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Remove member?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              Remove {removeTarget?.firstname} {removeTarget?.lastname} from
              this group?
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
                removeTarget && removeMutation.mutate(removeTarget.author_id)
              }
            >
              {removeMutation.isPending ? "Removing…" : "Remove"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupMembersPanel;
