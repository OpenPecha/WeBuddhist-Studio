import type { UseFormReturn } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { Textarea } from "@/components/ui/atoms/textarea";
import type { LanguageCode, SeriesFormData } from "@/schema/SeriesSchema";
import { getEnglishLanguageLabel } from "@/components/routes/create-series/utils/language";

type LanguageDetailsCardProps = {
  code: LanguageCode;
  form: UseFormReturn<SeriesFormData>;
  readOnly: boolean;
  onRemove: (code: LanguageCode) => void;
};

const LanguageDetailsCard = ({
  code,
  form,
  readOnly,
  onRemove,
}: LanguageDetailsCardProps) => {
  const label = getEnglishLanguageLabel(code);

  return (
    <div className="relative rounded-lg border border-input bg-[#FAFAFA] dark:bg-[#262626] p-4 space-y-3">
      <button
        type="button"
        onClick={() => onRemove(code)}
        disabled={readOnly}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 rounded disabled:opacity-40"
        aria-label={`Remove ${label}`}
      >
        <IoMdClose className="h-4 w-4" />
      </button>
      <Pecha.FormField
        control={form.control}
        name={`languages.${code}.title`}
        render={({ field }) => (
          <Pecha.FormItem>
            <Pecha.FormLabel className="text-sm font-bold">
              {label} title
            </Pecha.FormLabel>
            <Pecha.FormControl>
              <Pecha.Input
                placeholder={`Title in ${label}`}
                className="h-12 text-base bg-white dark:bg-[#181818]"
                disabled={readOnly}
                {...field}
              />
            </Pecha.FormControl>
            <Pecha.FormMessage />
          </Pecha.FormItem>
        )}
      />

      <Pecha.FormField
        control={form.control}
        name={`languages.${code}.sub_title`}
        render={({ field }) => (
          <Pecha.FormItem>
            <Pecha.FormLabel className="text-sm font-bold">
              {label} sub title
            </Pecha.FormLabel>
            <Pecha.FormControl>
              <Pecha.Input
                placeholder={`Sub title in ${label}`}
                className="h-12 text-base bg-white dark:bg-[#181818]"
                disabled={readOnly}
                {...field}
              />
            </Pecha.FormControl>
            <Pecha.FormMessage />
          </Pecha.FormItem>
        )}
      />

      <Pecha.FormField
        control={form.control}
        name={`languages.${code}.description`}
        render={({ field }) => (
          <Pecha.FormItem>
            <Pecha.FormLabel className="text-sm font-bold">
              {label} description
            </Pecha.FormLabel>
            <Pecha.FormControl>
              <Textarea
                placeholder={`Description in ${label}`}
                className="min-h-[100px] w-full rounded-md border border-input bg-white dark:bg-[#181818] px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none resize-none"
                disabled={readOnly}
                {...field}
              />
            </Pecha.FormControl>
            <Pecha.FormMessage />
          </Pecha.FormItem>
        )}
      />
    </div>
  );
};

export default LanguageDetailsCard;
