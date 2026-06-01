import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  createGroupInvite,
  fetchGroupInvites,
  revokeGroupInvite,
  type AuthorGroupInviteStatus,
  type AuthorGroupMemberRole,
} from "../api/groupsApi";
import {
  canRevokeInvite,
  inviteRoleOptions,
  normalizeMemberRole,
} from "../lib/groupPermissions";
import { GroupSectionHeader } from "./GroupSection";
import GroupInviteStatusBadge from "./GroupInviteStatusBadge";
import InviteExpiryLabel from "./InviteExpiryLabel";

const STATUS_FILTER_OPTIONS: {
  value: "all" | AuthorGroupInviteStatus;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REVOKED", label: "Revoked" },
  { value: "EXPIRED", label: "Expired" },
];

type GroupInvitesAdminSectionProps = {
  groupId: string;
  myRole: AuthorGroupMemberRole | undefined;
};

const GroupInvitesAdminSection = ({
  groupId,
  myRole,
}: GroupInvitesAdminSectionProps) => {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AuthorGroupMemberRole>("AUTHOR");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AuthorGroupInviteStatus
  >("all");

  const availableInviteRoles = useMemo(
    () => inviteRoleOptions(myRole),
    [myRole],
  );

  const statusParam = statusFilter === "all" ? undefined : statusFilter;

  const { data: invitesData, isLoading } = useQuery({
    queryKey: ["cms-group-invites", groupId, statusFilter],
    queryFn: () => fetchGroupInvites(groupId, statusParam),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cms-group", groupId] });
    queryClient.invalidateQueries({ queryKey: ["cms-group-invites", groupId] });
    queryClient.invalidateQueries({ queryKey: ["cms-my-group-invites"] });
    queryClient.invalidateQueries({ queryKey: ["cms-notifications"] });
  };

  const inviteMutation = useMutation({
    mutationFn: () =>
      createGroupInvite(groupId, {
        target_email: targetEmail.trim(),
        role: inviteRole,
      }),
    onSuccess: () => {
      toast.success("Invitation sent");
      setInviteOpen(false);
      setTargetEmail("");
      setInviteRole(availableInviteRoles[0] ?? "AUTHOR");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => revokeGroupInvite(groupId, inviteId),
    onSuccess: () => {
      toast.success("Invitation revoked");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const invites = invitesData?.invites ?? [];

  return (
    <div className="space-y-4 border-t border-dashed border-gray-300 dark:border-input pt-8">
      <GroupSectionHeader
        title="Invitations"
        action={
          availableInviteRoles.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(true)}
            >
              Invite member
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted-foreground">Status</label>
        <Pecha.Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as "all" | AuthorGroupInviteStatus)
          }
        >
          <Pecha.SelectTrigger className="w-40 h-8">
            <Pecha.SelectValue />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <Pecha.SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </Pecha.SelectItem>
            ))}
          </Pecha.SelectContent>
        </Pecha.Select>
      </div>

      <div className="overflow-x-auto">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Email</Pecha.TableHead>
              <Pecha.TableHead>Role</Pecha.TableHead>
              <Pecha.TableHead>Status</Pecha.TableHead>
              <Pecha.TableHead>Expires</Pecha.TableHead>
              <Pecha.TableHead>Invited by</Pecha.TableHead>
              <Pecha.TableHead className="text-right">Actions</Pecha.TableHead>
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>
            {isLoading ? (
              <Pecha.TableRow>
                <Pecha.TableCell colSpan={6} className="text-muted-foreground">
                  Loading invitations…
                </Pecha.TableCell>
              </Pecha.TableRow>
            ) : invites.length === 0 ? (
              <Pecha.TableRow>
                <Pecha.TableCell colSpan={6} className="text-muted-foreground">
                  No invitations found
                </Pecha.TableCell>
              </Pecha.TableRow>
            ) : (
              invites.map((invite) => (
                <Pecha.TableRow key={invite.id}>
                  <Pecha.TableCell>{invite.target_email}</Pecha.TableCell>
                  <Pecha.TableCell>
                    {normalizeMemberRole(invite.role)}
                  </Pecha.TableCell>
                  <Pecha.TableCell>
                    <GroupInviteStatusBadge status={invite.status} />
                  </Pecha.TableCell>
                  <Pecha.TableCell>
                    <InviteExpiryLabel invite={invite} />
                  </Pecha.TableCell>
                  <Pecha.TableCell className="text-muted-foreground text-sm">
                    {invite.created_by}
                  </Pecha.TableCell>
                  <Pecha.TableCell className="text-right">
                    {canRevokeInvite(myRole, invite) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={revokeMutation.isPending}
                        onClick={() => revokeMutation.mutate(invite.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </Pecha.TableCell>
                </Pecha.TableRow>
              ))
            )}
          </Pecha.TableBody>
        </Pecha.Table>
      </div>

      <Pecha.Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Invite member</Pecha.DialogTitle>
          </Pecha.DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The invitee must already be a registered author. They will receive
              an email and an in-app notification (valid for about 30 minutes).
              Authors who previously left can be invited again if they are not
              currently members and have no pending invite for this email.
            </p>
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
                onValueChange={(v) => setInviteRole(v as AuthorGroupMemberRole)}
              >
                <Pecha.SelectTrigger>
                  <Pecha.SelectValue />
                </Pecha.SelectTrigger>
                <Pecha.SelectContent>
                  {availableInviteRoles.map((role) => (
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
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!targetEmail.trim() || inviteMutation.isPending}
                onClick={() => inviteMutation.mutate()}
              >
                {inviteMutation.isPending ? "Sending…" : "Send invite"}
              </Button>
            </div>
          </div>
        </Pecha.DialogContent>
      </Pecha.Dialog>
    </div>
  );
};

export default GroupInvitesAdminSection;
