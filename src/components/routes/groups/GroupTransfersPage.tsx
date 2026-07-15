import { Navigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import GroupTransfersSection from "./components/GroupTransfersSection";
import type { GroupOutletContext } from "./GroupLayout";

const GroupTransfersPage = () => {
  const { groupId, canManageTransfers, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  if (readOnlyPlatform) {
    return <Navigate to={ROUTES.group(groupId)} replace />;
  }

  return (
    <GroupTransfersSection
      groupId={groupId}
      canManageIncoming={canManageTransfers}
      canManageOutgoing={canManageTransfers}
      alwaysVisible
    />
  );
};

export default GroupTransfersPage;
