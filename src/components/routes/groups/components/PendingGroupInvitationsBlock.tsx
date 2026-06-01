import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { fetchMyPendingGroupInvites } from "../api/groupsApi";
import GroupInviteRespondButtons from "./GroupInviteRespondButtons";
import InviteExpiryLabel from "./InviteExpiryLabel";

const PendingGroupInvitationsBlock = () => {
  const {
    data: invitesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cms-my-group-invites"],
    queryFn: fetchMyPendingGroupInvites,
    refetchOnWindowFocus: true,
  });

  const invites = invitesData?.invites ?? [];

  if (isLoading) return null;
  if (error) {
    return (
      <div className="mx-4 mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        Could not load pending invitations. {getApiErrorMessage(error)}
      </div>
    );
  }
  if (invites.length === 0) return null;

  return (
    <section className="mx-4 mb-6 rounded-lg border border-[#A51C21]/30 bg-white p-4 shadow-sm dark:border-[#A51C21]/50 dark:bg-[#262626]">
      <h2 className="text-lg font-semibold mb-1">Pending invitations</h2>
      <p className="text-sm text-muted-foreground mb-4">
        You have been invited to join the following author groups. Invitations
        expire in about 30 minutes.
      </p>
      <div className="overflow-x-auto">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Group</Pecha.TableHead>
              <Pecha.TableHead>Role</Pecha.TableHead>
              <Pecha.TableHead>Invited by</Pecha.TableHead>
              <Pecha.TableHead>Expires</Pecha.TableHead>
              <Pecha.TableHead className="text-center">Actions</Pecha.TableHead>
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>
            {invites.map((invite) => (
              <Pecha.TableRow key={invite.id}>
                <Pecha.TableCell className="font-medium">
                  {invite.group_name?.trim() || "Untitled group"}
                </Pecha.TableCell>
                <Pecha.TableCell>{invite.role}</Pecha.TableCell>
                <Pecha.TableCell className="text-muted-foreground text-sm">
                  {invite.created_by}
                </Pecha.TableCell>
                <Pecha.TableCell>
                  <InviteExpiryLabel invite={invite} />
                </Pecha.TableCell>
                <Pecha.TableCell className="text-center">
                  <GroupInviteRespondButtons invite={invite} />
                </Pecha.TableCell>
              </Pecha.TableRow>
            ))}
          </Pecha.TableBody>
        </Pecha.Table>
      </div>
    </section>
  );
};

export default PendingGroupInvitationsBlock;
