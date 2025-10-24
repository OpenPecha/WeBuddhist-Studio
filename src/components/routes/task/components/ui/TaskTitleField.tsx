import { Pecha } from "@/components/ui/shadimport";
import type { Control } from "react-hook-form";

interface TaskTitleFieldProps {
  isEditMode: boolean;
  isTitleEditing: boolean;
  formValue: string;
  control: Control<any>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TaskTitleField = ({
  isEditMode,
  isTitleEditing,
  formValue,
  control,
  onEdit,
  onSave,
  onCancel,
}: TaskTitleFieldProps) => {
  if (isEditMode && !isTitleEditing) {
    return (
      <>
        <div className="h-12 text-base flex items-center px-3 border opacity-80 rounded-md flex-1">
          {formValue}
        </div>
        <Pecha.Button variant="outline" type="button" onClick={onEdit}>
          Edit
        </Pecha.Button>
      </>
    );
  }

  if (isEditMode && isTitleEditing) {
    return (
      <>
        <Pecha.FormField
          control={control}
          name="title"
          render={({ field }) => (
            <Pecha.FormItem className="flex-1">
              <Pecha.FormControl>
                <Pecha.Input
                  type="text"
                  placeholder="Task Title"
                  className="h-12 text-base"
                  {...field}
                />
              </Pecha.FormControl>
              <Pecha.FormMessage />
            </Pecha.FormItem>
          )}
        />
        <div className="flex gap-2">
          <Pecha.Button variant="outline" type="button" onClick={onSave}>
            Save
          </Pecha.Button>
          <Pecha.Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Pecha.Button>
        </div>
      </>
    );
  }

  return (
    <Pecha.FormField
      control={control}
      name="title"
      render={({ field }) => (
        <Pecha.FormItem className="flex-1">
          <Pecha.FormControl>
            <Pecha.Input
              type="text"
              placeholder="Task Title"
              className="h-12 text-base"
              {...field}
            />
          </Pecha.FormControl>
          <Pecha.FormMessage />
        </Pecha.FormItem>
      )}
    />
  );
};
