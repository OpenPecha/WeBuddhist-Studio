import { useOutletContext } from "react-router-dom";
import GroupContentSection from "./components/GroupContentSection";
import GroupAccumulatorsPanel from "./components/GroupAccumulatorsPanel";
import type { GroupOutletContext } from "./GroupLayout";

const GroupContentPage = () => {
  const { groupId, userInfo, myRole, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  return (
    <div className="space-y-10">
      <GroupContentSection
        groupId={groupId}
        userInfo={userInfo}
        groupRole={myRole}
        readOnlyPlatform={readOnlyPlatform}
      />
      {!readOnlyPlatform ? (
        <GroupAccumulatorsPanel groupId={groupId} groupRole={myRole} />
      ) : null}
    </div>
  );
};

export default GroupContentPage;
