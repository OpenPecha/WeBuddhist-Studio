import { useState } from "react";
import { useParams } from "react-router-dom";
import TaskForm from "./components/TaskForm";
import SideBar from "./components/SideBar";
import { DefaultDayView } from "./components/DefaultView";

const PlanDetailsPage = () => {
  const { plan_id } = useParams<{ plan_id: string }>();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);

  const handleDaySelect = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowTaskForm(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <SideBar
        planId={plan_id!}
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onAddTaskClick={() => setShowTaskForm(true)}
      />
      <div className="flex-1 bg-white dark:bg-background px-4 overflow-y-auto">
        {showTaskForm && <TaskForm selectedDay={selectedDay} />}
        {!showTaskForm && <DefaultDayView selectedDay={selectedDay} />}
      </div>
    </div>
  );
};

export default PlanDetailsPage;
