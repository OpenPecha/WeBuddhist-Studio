import type { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "@/schema/EventSchema";
import type { FkOption } from "../FkMultiSearchSelector";
import { searchPlansForPicker } from "@/components/routes/groups/api/groupPickerApi";
import { searchAccumulatorPresets } from "@/components/routes/groups/api/accumulatorPresetSearchApi";
import EventLinkPicker from "./EventLinkPicker";

type EventLinksSectionProps = {
  form: UseFormReturn<EventFormData>;
  readOnly: boolean;
  planValue: FkOption | null;
  accumulatorValue: FkOption | null;
  onPlanChange: (item: FkOption | null) => void;
  onAccumulatorChange: (item: FkOption | null) => void;
};

const EventLinksSection = ({
  form,
  readOnly,
  planValue,
  accumulatorValue,
  onPlanChange,
  onAccumulatorChange,
}: EventLinksSectionProps) => {
  const makeSetter =
    (
      field: "plan_id" | "accumulator_id",
      report: (item: FkOption | null) => void,
    ) =>
    (item: FkOption | null) => {
      report(item);
      form.setValue(field, item?.id ?? "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">Linked content (optional)</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EventLinkPicker
          label="Plan"
          value={planValue}
          onChange={makeSetter("plan_id", onPlanChange)}
          searchFn={searchPlansForPicker}
          queryKeyPrefix="event-plan-picker"
          searchPlaceholder="Search plans…"
          disabled={readOnly}
        />
        <EventLinkPicker
          label="Accumulator"
          value={accumulatorValue}
          onChange={makeSetter("accumulator_id", onAccumulatorChange)}
          searchFn={searchAccumulatorPresets}
          queryKeyPrefix="event-accumulator-picker"
          searchPlaceholder="Search accumulators…"
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default EventLinksSection;
