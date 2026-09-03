import type { UseFormReturn } from "react-hook-form";
import { Pecha } from "@/components/ui/shadimport";
import { EVENT_FORMAT_OPTIONS, type EventFormData } from "@/schema/EventSchema";

const NONE_VALUE = "__none__";

type EventFormatFieldProps = {
  form: UseFormReturn<EventFormData>;
  readOnly: boolean;
};

const EventFormatField = ({ form, readOnly }: EventFormatFieldProps) => {
  return (
    <Pecha.FormField
      control={form.control}
      name="event_format"
      render={({ field }) => (
        <Pecha.FormItem>
          <Pecha.FormLabel className="text-sm font-medium">
            Format
          </Pecha.FormLabel>
          <Pecha.Select
            value={field.value ?? NONE_VALUE}
            onValueChange={(value) =>
              field.onChange(value === NONE_VALUE ? null : value)
            }
            disabled={readOnly}
          >
            <Pecha.FormControl>
              <Pecha.SelectTrigger className="h-11 w-full bg-white dark:bg-[#262626]">
                <Pecha.SelectValue placeholder="Select a format" />
              </Pecha.SelectTrigger>
            </Pecha.FormControl>
            <Pecha.SelectContent>
              <Pecha.SelectItem value={NONE_VALUE}>
                Not specified
              </Pecha.SelectItem>
              {EVENT_FORMAT_OPTIONS.map((option) => (
                <Pecha.SelectItem key={option.value} value={option.value}>
                  {option.label}
                </Pecha.SelectItem>
              ))}
            </Pecha.SelectContent>
          </Pecha.Select>
          <Pecha.FormMessage />
        </Pecha.FormItem>
      )}
    />
  );
};

export default EventFormatField;
