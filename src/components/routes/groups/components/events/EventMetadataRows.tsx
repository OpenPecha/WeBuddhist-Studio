import type { UseFormReturn } from "react-hook-form";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { PLAN_LANGUAGE } from "@/lib/constant";
import type { EventFormData, LanguageCode } from "@/schema/EventSchema";

type EventMetadataRowsProps = {
  form: UseFormReturn<EventFormData>;
  fields: { id: string }[];
  usedLanguages: LanguageCode[];
  canAddLanguage: boolean;
  readOnly: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

const languageLabel = (code: string) =>
  PLAN_LANGUAGE.find((l) => l.value === code)?.label ?? code;

const EventMetadataRows = ({
  form,
  fields,
  usedLanguages,
  canAddLanguage,
  readOnly,
  onAdd,
  onRemove,
}: EventMetadataRowsProps) => {
  const metadata = form.watch("metadata") ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Name &amp; description</h3>
        {!readOnly && canAddLanguage ? (
          <Pecha.Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="gap-1"
          >
            <IoMdAdd className="h-4 w-4" /> Add language
          </Pecha.Button>
        ) : null}
      </div>

      {fields.map((field, index) => {
        const currentLang = metadata[index]?.language;
        return (
          <div
            key={field.id}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Pecha.FormField
                control={form.control}
                name={`metadata.${index}.language`}
                render={({ field: langField }) => (
                  <Pecha.FormItem className="w-40">
                    <Pecha.FormLabel>Language</Pecha.FormLabel>
                    <Pecha.Select
                      value={langField.value}
                      onValueChange={langField.onChange}
                      disabled={readOnly}
                    >
                      <Pecha.FormControl>
                        <Pecha.SelectTrigger>
                          <Pecha.SelectValue placeholder="Language" />
                        </Pecha.SelectTrigger>
                      </Pecha.FormControl>
                      <Pecha.SelectContent>
                        {PLAN_LANGUAGE.map((lang) => {
                          const takenByAnother =
                            usedLanguages.includes(lang.value as LanguageCode) &&
                            lang.value !== currentLang;
                          return (
                            <Pecha.SelectItem
                              key={lang.value}
                              value={lang.value}
                              disabled={takenByAnother}
                            >
                              {lang.label}
                            </Pecha.SelectItem>
                          );
                        })}
                      </Pecha.SelectContent>
                    </Pecha.Select>
                    <Pecha.FormMessage />
                  </Pecha.FormItem>
                )}
              />

              {!readOnly && fields.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove ${languageLabel(currentLang ?? "")} row`}
                  onClick={() => onRemove(index)}
                  className="mt-8 text-muted-foreground hover:text-destructive"
                >
                  <IoMdClose className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <Pecha.FormField
              control={form.control}
              name={`metadata.${index}.name`}
              render={({ field: nameField }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel>Name</Pecha.FormLabel>
                  <Pecha.FormControl>
                    <Pecha.Input
                      {...nameField}
                      placeholder="Event name"
                      disabled={readOnly}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />

            <Pecha.FormField
              control={form.control}
              name={`metadata.${index}.description`}
              render={({ field: descField }) => (
                <Pecha.FormItem>
                  <Pecha.FormLabel>Description (optional)</Pecha.FormLabel>
                  <Pecha.FormControl>
                    <Pecha.Textarea
                      {...descField}
                      placeholder="Description"
                      disabled={readOnly}
                      rows={3}
                    />
                  </Pecha.FormControl>
                  <Pecha.FormMessage />
                </Pecha.FormItem>
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EventMetadataRows;
