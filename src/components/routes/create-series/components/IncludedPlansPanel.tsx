import type { UseFormReturn } from "react-hook-form";
import PlanSearchSelector from "@/components/routes/create-series/components/PlanSearchSelector";
import type { LanguageCode, SeriesFormData } from "@/schema/SeriesSchema";
import { getNativeLanguageLabel } from "@/components/routes/create-series/utils/language";

type IncludedPlansPanelProps = {
  form: UseFormReturn<SeriesFormData>;
  orderedLanguages: LanguageCode[];
  plans: SeriesFormData["plans"];
  activeLanguage: LanguageCode | null;
  readOnly: boolean;
  groupId?: string;
  onSelectLanguage: (code: LanguageCode) => void;
};

const IncludedPlansPanel = ({
  form,
  orderedLanguages,
  plans,
  activeLanguage,
  readOnly,
  groupId,
  onSelectLanguage,
}: IncludedPlansPanelProps) => {
  if (orderedLanguages.length === 0) {
    return (
      <div className="flex-1 rounded-md border border-dashed border-muted-foreground/40 p-8 text-center text-sm text-muted-foreground">
        Add at least one language on the left to attach plans.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 border-b border-border mb-4">
        {orderedLanguages.map((code) => {
          const label = getNativeLanguageLabel(code);
          const count = plans[code]?.length ?? 0;
          const isActive = activeLanguage === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelectLanguage(code)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-[#B82E2E] text-[#B82E2E] font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{label}</span>
              <span className="text-[#737373]"> ({count})</span>
            </button>
          );
        })}
      </div>

      {!readOnly && activeLanguage != null && (
        <PlanSearchSelector
          value={plans[activeLanguage] ?? []}
          onChange={(next) => {
            const current = form.getValues("plans") ?? {};
            form.setValue(
              "plans",
              { ...current, [activeLanguage]: next },
              { shouldDirty: true, shouldValidate: true },
            );
          }}
          searchLanguage={activeLanguage}
          groupId={groupId}
        />
      )}
    </>
  );
};

export default IncludedPlansPanel;
