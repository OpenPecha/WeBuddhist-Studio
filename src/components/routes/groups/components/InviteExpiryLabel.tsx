import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { GroupInviteDTO } from "../api/groupsApi";
import { isGroupInviteExpired } from "../api/groupsApi";

type InviteExpiryLabelProps = {
  invite: GroupInviteDTO;
};

const InviteExpiryLabel = ({ invite }: InviteExpiryLabelProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isGroupInviteExpired(invite)) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [invite.expires_at, invite.status]);

  if (isGroupInviteExpired(invite)) {
    return <span className="text-muted-foreground">Expired</span>;
  }

  return (
    <span className="text-muted-foreground">
      {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: false })}{" "}
      left
    </span>
  );
};

export default InviteExpiryLabel;
