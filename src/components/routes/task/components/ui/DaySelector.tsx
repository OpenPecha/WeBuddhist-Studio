import { Pecha } from "@/components/ui/shadimport";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChangeTaskDay } from "../../api/taskApi";

interface DaySelectorProps {
  selectedDay: number;
  taskId: string;
}

const DaySelector = ({ selectedDay, taskId }: DaySelectorProps) => {
  const queryClient = useQueryClient();
  const { plan_id } = useParams<{ plan_id: string }>();

  const currentPlan = queryClient.getQueryData<any>(["planDetails", plan_id]);
  const days = currentPlan?.days || [];

  const changeTaskDayMutation = useMutation({
    mutationFn: async (target_day_id: string) => {
      return await ChangeTaskDay(taskId, target_day_id);
    },
    onSuccess: () => {
      toast.success("Task moved successfully!", {
        description: "The task has been moved to the selected day.",
      });
      queryClient.invalidateQueries({ queryKey: ["planDetails", plan_id] });
      queryClient.invalidateQueries({ queryKey: ["taskDetails", taskId] });
    },
    onError: (error: any) => {
      toast.error("Failed to move task", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  const handleDayChange = (value: string) => {
    changeTaskDayMutation.mutate(value);
  };

  return (
    <div>
      <Pecha.Select onValueChange={handleDayChange}>
        <Pecha.SelectTrigger className="w-32">
          <Pecha.SelectValue placeholder={`Day ${selectedDay}`} />
        </Pecha.SelectTrigger>
        <Pecha.SelectContent>
          <Pecha.SelectGroup>
            <Pecha.SelectLabel>Days</Pecha.SelectLabel>
            {days.map((day: any) => (
              <Pecha.SelectItem
                disabled={day.day_number === selectedDay}
                key={day.id}
                value={day.id}
                className="cursor-pointer"
              >
                Day {day.day_number}
              </Pecha.SelectItem>
            ))}
          </Pecha.SelectGroup>
        </Pecha.SelectContent>
      </Pecha.Select>
    </div>
  );
};

export default DaySelector;
