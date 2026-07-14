import { useOutletContext } from "react-router-dom";
import GroupMembersPanel from "./components/GroupMembersPanel";
import type { GroupOutletContext } from "./GroupLayout";

const GroupMembersPage = () => {
  const { group, groupId } = useOutletContext<GroupOutletContext>();

  return <GroupMembersPanel groupId={groupId} members={group.members ?? []} />;
};

export default GroupMembersPage;
