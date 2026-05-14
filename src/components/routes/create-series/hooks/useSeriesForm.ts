import { useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PLAN_LANGUAGE } from "@/lib/constant";
import {
  seriesSchema,
  type SeriesFormData,
  type LanguageCode,
  type SeriesPlan,
} from "@/schema/SeriesSchema";

export type UseSeriesFormReturn = {
  form: UseFormReturn<SeriesFormData>;
  languages: SeriesFormData["languages"];
  plans: SeriesFormData["plans"];
  imageUrl: string;
  addedLanguages: LanguageCode[];
  availableLanguages: typeof PLAN_LANGUAGE;
  canSubmit: boolean;
  addLanguage: (code: LanguageCode) => void;
  removeLanguage: (code: LanguageCode) => void;
  addPlan: (code: LanguageCode, plan: SeriesPlan) => void;
  removePlan: (code: LanguageCode, planId: string) => void;
  reorderPlans: (code: LanguageCode, plans: SeriesPlan[]) => void;
  setImageUrl: (url: string) => void;
};

export const useSeriesForm = (): UseSeriesFormReturn => {
  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      languages: {},
      plans: {},
      image_url: "",
    } satisfies SeriesFormData,
    mode: "onChange",
  });

  const languages = form.watch("languages") ?? {};
  const plans = form.watch("plans") ?? {};
  const imageUrl = form.watch("image_url") ?? "";

  const addedLanguages = Object.keys(languages) as LanguageCode[];
  const availableLanguages = PLAN_LANGUAGE.filter(
    ({ value }) => !languages[value as LanguageCode],
  );
  const allAddedLanguagesComplete =
    addedLanguages.length > 0 &&
    addedLanguages.every((code) => {
      const block = languages[code];
      return !!block?.title.trim() && !!block?.description.trim();
    });
  const canSubmit =
    allAddedLanguagesComplete && (imageUrl?.trim()?.length ?? 0) > 0;

  const addLanguage = useCallback(
    (code: LanguageCode) => {
      const current = form.getValues("languages") ?? {};
      if (current[code]) return;
      form.setValue(
        "languages",
        { ...current, [code]: { title: "", description: "" } },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form],
  );

  const removeLanguage = useCallback(
    (code: LanguageCode) => {
      const currentLanguages = form.getValues("languages") ?? {};
      const currentPlans = form.getValues("plans") ?? {};
      const { [code]: _l, ...restLanguages } = currentLanguages;
      const { [code]: _p, ...restPlans } = currentPlans;
      form.setValue("languages", restLanguages, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("plans", restPlans, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const addPlan = useCallback(
    (code: LanguageCode, plan: SeriesPlan) => {
      const current = form.getValues("plans") ?? {};
      const existing = current[code] ?? [];
      if (existing.some((p) => p.id === plan.id)) return;
      form.setValue(
        "plans",
        { ...current, [code]: [...existing, plan] },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form],
  );

  const removePlan = useCallback(
    (code: LanguageCode, planId: string) => {
      const current = form.getValues("plans") ?? {};
      const existing = current[code] ?? [];
      form.setValue(
        "plans",
        { ...current, [code]: existing.filter((p) => p.id !== planId) },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form],
  );

  const reorderPlans = useCallback(
    (code: LanguageCode, reordered: SeriesPlan[]) => {
      const current = form.getValues("plans") ?? {};
      form.setValue(
        "plans",
        { ...current, [code]: reordered },
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [form],
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

  return {
    form,
    languages,
    plans,
    imageUrl,
    addedLanguages,
    availableLanguages,
    canSubmit,
    addLanguage,
    removeLanguage,
    addPlan,
    removePlan,
    reorderPlans,
    setImageUrl,
  };
};
