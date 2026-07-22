import { useCallback } from "react";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventSchema,
  defaultEventFormValues,
  emptyMetadataRow,
  type EventFormData,
  type LanguageCode,
} from "@/schema/EventSchema";
import {
  useLanguages,
  type StudioLanguageOption,
} from "@/hooks/useLanguages";

export type UseEventFormReturn = {
  form: UseFormReturn<EventFormData>;
  metadataRows: ReturnType<typeof useFieldArray<EventFormData, "metadata">>;
  usedLanguages: LanguageCode[];
  availableLanguages: StudioLanguageOption[];
  addMetadataRow: () => void;
  removeMetadataRow: (index: number) => void;
  setImageUrl: (url: string) => void;
  setOneDay: (oneDay: boolean) => void;
  setStartDate: (iso: string) => void;
  setEndDate: (iso: string) => void;
};

export const useEventForm = (): UseEventFormReturn => {
  const { languageOptions } = useLanguages();
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultEventFormValues(),
    mode: "onChange",
  });

  const metadataRows = useFieldArray({
    control: form.control,
    name: "metadata",
  });

  const metadata = form.watch("metadata") ?? [];
  const usedLanguages = metadata.map((m) => m.language);
  const availableLanguages = languageOptions.filter(
    ({ value }) => !usedLanguages.includes(value),
  );

  const addMetadataRow = useCallback(() => {
    const current = form.getValues("metadata") ?? [];
    const used = new Set(current.map((m) => m.language));
    const next = languageOptions
      .map((l) => l.value as LanguageCode)
      .find((code) => !used.has(code));
    if (!next) return;
    metadataRows.append(emptyMetadataRow(next));
  }, [form, metadataRows, languageOptions]);

  const removeMetadataRow = useCallback(
    (index: number) => {
      if ((form.getValues("metadata") ?? []).length <= 1) return;
      metadataRows.remove(index);
    },
    [form, metadataRows],
  );

  const setImageUrl = useCallback(
    (url: string) => {
      form.setValue("image_url", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const setStartDate = useCallback(
    (iso: string) => {
      form.setValue("start_date", iso, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (form.getValues("is_one_day")) {
        form.setValue("end_date", iso, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [form],
  );

  const setEndDate = useCallback(
    (iso: string) => {
      form.setValue("end_date", iso, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const setOneDay = useCallback(
    (oneDay: boolean) => {
      form.setValue("is_one_day", oneDay, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (oneDay) {
        const start = form.getValues("start_date");
        if (start) {
          form.setValue("end_date", start, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
    },
    [form],
  );

  return {
    form,
    metadataRows,
    usedLanguages,
    availableLanguages,
    addMetadataRow,
    removeMetadataRow,
    setImageUrl,
    setOneDay,
    setStartDate,
    setEndDate,
  };
};
