import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SplitPane, Pane } from "react-split-pane";
import TaskForm from "./components/view/TaskForm";
import SideBar from "./components/sidebar-component/SideBar";
import TaskView from "./components/view/TaskView";
import MobileView from "./components/MobileView";
import { fetchPlanDetails } from "./api/planApi";
import { useUserInfo } from "@/hooks/useUserInfo";
import { fetchGroup } from "@/components/routes/groups/api/groupsApi";
import { getCurrentUserGroupRole } from "@/components/routes/groups/lib/groupPermissions";
import { canEditContent } from "@/lib/contentPermissions";
import { HiOutlineDeviceMobile } from "react-icons/hi";

const PlanDetailsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(true);
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  // Get selected day from URL params, default to day 1
  const selectedDay = useMemo(() => {
    const dayParam = searchParams.get("day");
    return dayParam ? Number.parseInt(dayParam, 10) : 1;
  }, [searchParams]);

  // Function to update search params
  const updateSearchParams = useCallback(
    (day: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (day === 1) {
        // Remove day param if it's the default (day 1)
        newParams.delete("day");
      } else {
        newParams.set("day", day.toString());
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Use the specific plan ID from the URL or redirect if not provided
  useEffect(() => {
    if (!planId) {
      // If no planId in URL but we want to use the specific one from the WeBuddhist plan viewer
      const targetPlanId = "24e15ca6-ae54-4b5c-a12d-11355730158e";
      navigate(`/plans/${targetPlanId}`, { replace: true });
    }
  }, [planId, navigate]);

  // Clear selected task and editing task when day changes
  useEffect(() => {
    setSelectedTaskId(null);
    setEditingTask(null);
  }, [selectedDay]);

  const { data: userInfo } = useUserInfo();

  const { data: planDetails } = useQuery({
    queryKey: ["planDetails", planId],
    queryFn: () => fetchPlanDetails(planId!),
    enabled: !!planId,
  });

  const groupId = planDetails?.group_id as string | undefined;

  const { data: planGroup } = useQuery({
    queryKey: ["cms-group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const groupRole = planGroup
    ? getCurrentUserGroupRole(planGroup.members ?? [], userInfo)
    : undefined;

  const isEditable = canEditContent(
    groupRole,
    planDetails?.status ?? "DRAFT",
    userInfo?.platform_role,
  );
  const isPlanPublished = planDetails?.status === "PUBLISHED";
  const currentDayData = planDetails?.days?.find(
    (day: { day_number: number }) => day.day_number === selectedDay,
  );

  // Get the selected day ID for passing to MobileView
  const selectedDayId = currentDayData?.id;

  const handleDaySelect = (dayNumber: number) => {
    updateSearchParams(dayNumber);
    setSelectedTaskId(null);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    if (!isEditable) {
      return;
    }
    setEditingTask(task);
    setSelectedTaskId(null);
  };

  const handleCancelTaskForm = (newlyCreatedTaskId?: string) => {
    setEditingTask(null);
    if (newlyCreatedTaskId) {
      setSelectedTaskId(newlyCreatedTaskId);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }
  };

  return (
    <div className="h-full relative">
      <div className="flex h-full">
        <SideBar
          selectedDay={selectedDay}
          selectedDayId={selectedDayId}
          onDaySelect={handleDaySelect}
          onTaskClick={(taskId) => {
            setSelectedTaskId(taskId);
          }}
          onTaskDelete={handleTaskDelete}
          isEditable={isEditable}
        />

        {showMobilePreview && isPlanPublished ? (
          <SplitPane direction="horizontal" className="flex-1">
            <Pane defaultSize="60%" minSize="300px">
              <div className="pl-4 rounded-l-2xl overflow-y-auto h-full">
                {selectedTaskId ? (
                  <TaskView
                    taskId={selectedTaskId}
                    onEditTask={handleEditTask}
                    isEditable={isEditable}
                    dayAudioUrl={currentDayData?.audio_url}
                  />
                ) : (
                  <TaskForm
                    selectedDay={selectedDay}
                    editingTask={editingTask}
                    onCancel={handleCancelTaskForm}
                    isEditable={isEditable}
                  />
                )}
              </div>
            </Pane>

            <Pane>
              <div className="h-full border-l border-gray-200 dark:border-gray-700">
                <MobileView />
              </div>
            </Pane>
          </SplitPane>
        ) : (
          <div className="flex-1 pl-4 rounded-l-2xl overflow-y-auto">
            {selectedTaskId ? (
              <TaskView
                taskId={selectedTaskId}
                onEditTask={handleEditTask}
                isEditable={isEditable}
                dayAudioUrl={currentDayData?.audio_url}
              />
            ) : (
              <TaskForm
                selectedDay={selectedDay}
                editingTask={editingTask}
                onCancel={handleCancelTaskForm}
                isEditable={isEditable}
              />
            )}
          </div>
        )}
      </div>

      {/* Toggle Button - Only show if plan is published */}
      {isPlanPublished && (
        <button
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="fixed bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-20"
          title={
            showMobilePreview ? "Hide Mobile Preview" : "Show Mobile Preview"
          }
        >
          <HiOutlineDeviceMobile className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default PlanDetailsPage;
