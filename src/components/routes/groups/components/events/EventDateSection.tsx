import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { IoCalendarClearOutline } from "react-icons/io5";
import { format } from "date-fns";
import { Pecha } from "@/components/ui/shadimport";
import { fromBackendISO, toBackendISO } from "@/lib/utils";
import type { EventFormData } from "@/schema/EventSchema";

type EventDateSectionProps = {
  form: UseFormReturn<EventFormData>;
  isOneDay: boolean;
  readOnly: boolean;
  onStartChange: (iso: string) => void;
  onEndChange: (iso: string) => void;
  onOneDayChange: (oneDay: boolean) => void;
};

const DatePickerButton = ({
  value,
  disabled,
  onSelect,
}: {
  value: string;
  disabled?: boolean;
  onSelect: (iso: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Pecha.Popover open={open} onOpenChange={setOpen}>
      <Pecha.PopoverTrigger asChild>
        <Pecha.Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-12 w-full justify-start gap-2 px-3 font-normal rounded-md"
        >
          <IoCalendarClearOutline className="h-4 w-4 text-muted-foreground" />
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value
              ? format(fromBackendISO(value), "MMM d, yyyy")
              : "Choose date"}
          </span>
        </Pecha.Button>
      </Pecha.PopoverTrigger>
      <Pecha.PopoverContent className="w-auto p-0" align="start">
        <Pecha.Calendar
          className="cursor-pointer"
          mode="single"
          selected={value ? fromBackendISO(value) : undefined}
          onSelect={(d) => {
            setOpen(false);
            if (d) onSelect(toBackendISO(d));
          }}
        />
      </Pecha.PopoverContent>
    </Pecha.Popover>
  );
};

const EventDateSection = ({
  form,
  isOneDay,
  readOnly,
  onStartChange,
  onEndChange,
  onOneDayChange,
}: EventDateSectionProps) => {
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const { errors } = form.formState;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Dates</h3>
        <label className="flex items-center gap-2 text-sm">
          <Pecha.Checkbox
            checked={isOneDay}
            disabled={readOnly}
            onCheckedChange={(checked) => onOneDayChange(checked === true)}
          />
          One-day event
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-sm font-medium">Start date</span>
          <DatePickerButton
            value={startDate}
            disabled={readOnly}
            onSelect={onStartChange}
          />
          {errors.start_date ? (
            <p className="text-sm text-destructive">
              {errors.start_date.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium">End date</span>
          <DatePickerButton
            value={endDate}
            disabled={readOnly || isOneDay}
            onSelect={onEndChange}
          />
          {errors.end_date ? (
            <p className="text-sm text-destructive">
              {errors.end_date.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventDateSection;
