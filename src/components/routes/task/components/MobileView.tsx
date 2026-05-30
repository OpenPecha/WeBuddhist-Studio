import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPlanDetails } from "../api/planApi";



const MobileView = () => {
  const { planId } = useParams<{ planId: string }>();

  const { data: planDetails, isLoading } = useQuery({
    queryKey: ["planDetails", planId],
    queryFn: () => fetchPlanDetails(planId!),
    enabled: !!planId,
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!planDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan not found</p>
        </div>
      </div>
    );
  }
  const ViewURL=import.meta.env.VITE_WEBUDDHIST_PLAN_VIEWER_URL + `/plan/${planId}`
  return (
    <div className="w-full h-full">
      {/* Embedded WeBuddhist Plan Viewer */}
      {planId && (
        <iframe
          src={ViewURL}
          className="w-full h-full border-0 block"
          title={`WeBuddhist Plan Viewer - ${planId}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      )}
    </div>
  );
};

export default MobileView;