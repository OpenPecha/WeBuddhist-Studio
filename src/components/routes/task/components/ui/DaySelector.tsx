import { Pecha } from "@/components/ui/shadimport";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface DaySelectorProps {
  selectedDay: number;
}

const DaySelector = ({ selectedDay }: DaySelectorProps) => {
  const queryClient = useQueryClient();
  const { plan_id } = useParams<{ plan_id: string }>();

  const currentPlan = queryClient.getQueryData<any>(["planDetails", plan_id]);
  const days = currentPlan?.days || [];

  return (
    <div>
      <Pecha.Select>
        <Pecha.SelectTrigger className="w-[180px]">
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
