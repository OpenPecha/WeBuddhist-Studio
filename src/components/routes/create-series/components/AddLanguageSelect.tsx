import { IoMdAdd } from "react-icons/io";
import { Pecha } from "@/components/ui/shadimport";
import { PLAN_LANGUAGE } from "@/lib/constant";
import type { LanguageCode } from "@/schema/SeriesSchema";

type AddLanguageSelectProps = {
  availableLanguages: typeof PLAN_LANGUAGE;
  addedLanguages: LanguageCode[];
  onAdd: (code: LanguageCode) => void;
};

const AddLanguageSelect = ({
  availableLanguages,
  addedLanguages,
  onAdd,
}: AddLanguageSelectProps) => (
  <Pecha.Select
    key={addedLanguages.join(",")}
    onValueChange={(v) => onAdd(v as LanguageCode)}
  >
    <Pecha.SelectTrigger className="h-11 w-fit max-w-md border-dashed bg-white dark:bg-[#262626]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IoMdAdd className="h-5 w-5" />
        <Pecha.SelectValue
          className="text-[#1A1A1A] font-semibold text-sm"
          placeholder="Add series details"
        />
      </div>
    </Pecha.SelectTrigger>
    <Pecha.SelectContent>
      {availableLanguages.map((lang) => (
        <Pecha.SelectItem key={lang.value} value={lang.value}>
          {lang.label}
        </Pecha.SelectItem>
      ))}
    </Pecha.SelectContent>
  </Pecha.Select>
);

export default AddLanguageSelect;
