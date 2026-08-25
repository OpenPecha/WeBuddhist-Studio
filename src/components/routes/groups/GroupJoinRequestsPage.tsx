import { Navigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import GroupJoinRequestsSection from "./components/GroupJoinRequestsSection";
import { canManageJoinRequests } from "./lib/groupPermissions";
import type { GroupOutletContext } from "./GroupLayout";

const GroupJoinRequestsPage = () => {
  const { groupId, myRole, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  if (readOnlyPlatform || !canManageJoinRequests(myRole)) {
    return <Navigate to={ROUTES.group(groupId)} replace />;
  }

  return <GroupJoinRequestsSection groupId={groupId} canModerate />;
};

export default GroupJoinRequestsPage;
