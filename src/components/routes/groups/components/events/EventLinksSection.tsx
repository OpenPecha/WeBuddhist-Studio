import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "@/schema/EventSchema";
import type { FkOption } from "../FkMultiSearchSelector";
import { makeLinkedContentSearchFn } from "@/components/routes/groups/api/groupPickerApi";
import { searchAccumulatorPresets } from "@/components/routes/groups/api/accumulatorPresetSearchApi";
import EventLinkPicker from "./EventLinkPicker";

type EventLinksSectionProps = {
  form: UseFormReturn<EventFormData>;
  groupId: string;
  readOnly: boolean;
  contentValue: FkOption | null;
  accumulatorValue: FkOption | null;
  onContentChange: (item: FkOption | null) => void;
  onAccumulatorChange: (item: FkOption | null) => void;
};

const EventLinksSection = ({
  form,
  groupId,
  readOnly,
  contentValue,
  accumulatorValue,
  onContentChange,
  onAccumulatorChange,
}: EventLinksSectionProps) => {
  const handleContentChange = (item: FkOption | null) => {
    onContentChange(item);
    const opts = { shouldDirty: true, shouldValidate: true } as const;
    form.setValue("plan_id", item?.kind === "plan" ? item.id : "", opts);
    form.setValue("series_id", item?.kind === "series" ? item.id : "", opts);
  };

  const handleAccumulatorChange = (item: FkOption | null) => {
    onAccumulatorChange(item);
    form.setValue("accumulator_id", item?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const contentSearchFn = useMemo(
    () => makeLinkedContentSearchFn(groupId),
    [groupId],
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">Linked content (optional)</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EventLinkPicker
          label="Plan or series"
          value={contentValue}
          onChange={handleContentChange}
          searchFn={contentSearchFn}
          queryKeyPrefix={`event-content-picker-${groupId}`}
          searchPlaceholder="Search plans & series…"
          disabled={readOnly}
        />
        <EventLinkPicker
          label="Accumulator"
          value={accumulatorValue}
          onChange={handleAccumulatorChange}
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
