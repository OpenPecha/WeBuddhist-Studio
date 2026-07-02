import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { IoMdAdd, IoMdClose, IoMdRemove } from "react-icons/io";
import { FiLoader } from "react-icons/fi";
import { Pecha } from "@/components/ui/shadimport";
import { Input } from "@/components/ui/atoms/input";
import {
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/atoms/dialog";
import {
  fetchPlanDetails,
  searchCmsPlans,
  type CreateDaysRequest,
} from "@/components/routes/task/api/planApi";
import { getNativeLanguageLabel } from "@/components/routes/create-series/utils/language";
import { normalizeLanguageCode } from "@/lib/languageCodes";

interface DayCreateDialogProps {
  disabled?: boolean;
  isPending?: boolean;
  onSubmit: (req: CreateDaysRequest) => void;
}

const PLAN_SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 10;

const DayCreateDialog = ({
  disabled,
  isPending,
  onSubmit,
}: DayCreateDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const [numberOfDays, setNumberOfDays] = useState(1);

  const [templatePlanId, setTemplatePlanId] = useState<string | undefined>();
  const [templatePlanTitle, setTemplatePlanTitle] = useState("");
  const [templatePlanLanguage, setTemplatePlanLanguage] = useState("");
  const [sourceDayId, setSourceDayId] = useState<string | undefined>();

  const [planSearch, setPlanSearch] = useState("");
  const [debouncedPlanSearch] = useDebounce(
    planSearch,
    PLAN_SEARCH_DEBOUNCE_MS,
  );
  const [showPlanPicker, setShowPlanPicker] = useState(false);

  const { data: planSearchData, isFetching: isPlanFetching } = useInfiniteQuery(
    {
      queryKey: ["day-create-cms-plan-search", debouncedPlanSearch],
      queryFn: ({ pageParam = 0 }) =>
        searchCmsPlans({
          search: debouncedPlanSearch.trim() || undefined,
          skip: pageParam,
          limit: PAGE_SIZE,
        }),
      getNextPageParam: (lastPage) => {
        const fetched = lastPage.skip + lastPage.plans.length;
        return fetched < lastPage.total ? fetched : undefined;
      },
      initialPageParam: 0,
      enabled: open && showPlanPicker,
      refetchOnWindowFocus: false,
    },
  );

  const { data: templatePlanData, isFetching: isTemplatePlanFetching } =
    useQuery({
      queryKey: ["day-create-template-plan", templatePlanId],
      queryFn: () => fetchPlanDetails(templatePlanId!),
      enabled: !!templatePlanId && open,
      refetchOnWindowFocus: false,
    });

  const planOptions = planSearchData?.pages.flatMap((page) => page.plans) ?? [];
  const templateDays: Array<{ id: string; day_number: number }> =
    templatePlanData?.days ?? [];

  const resetForm = () => {
    setNumberOfDays(1);
    setTemplatePlanId(undefined);
    setTemplatePlanTitle("");
    setTemplatePlanLanguage("");
    setSourceDayId(undefined);
    setPlanSearch("");
    setShowPlanPicker(false);
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) resetForm();
  };

  const addLabel = `Add ${numberOfDays} ${numberOfDays === 1 ? "Day" : "Days"}`;

  const handleSubmit = () => {
    onSubmit({
      number_of_days: numberOfDays,
      source_day_id: sourceDayId,
    });
    setOpen(false);
    resetForm();
  };

  const formatPlanLanguage = (language: string) => {
    const code = normalizeLanguageCode(language);
    return code ? getNativeLanguageLabel(code) : language;
  };

  const selectPlan = (id: string, title: string, language: string) => {
    setTemplatePlanId(id);
    setTemplatePlanTitle(title);
    setTemplatePlanLanguage(language);
    setSourceDayId(undefined);
    setPlanSearch("");
    setShowPlanPicker(false);
  };

  const clearPlan = () => {
    setTemplatePlanId(undefined);
    setTemplatePlanTitle("");
    setTemplatePlanLanguage("");
    setSourceDayId(undefined);
    setPlanSearch("");
    setShowPlanPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowPlanPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showPlanDropdown =
    showPlanPicker &&
    (isPlanFetching ||
      planOptions.length > 0 ||
      debouncedPlanSearch.trim().length > 0);

  const planInputValue = showPlanPicker
    ? planSearch
    : templatePlanLanguage
      ? `${templatePlanTitle} (${formatPlanLanguage(templatePlanLanguage)})`
      : templatePlanTitle;

  return (
    <Pecha.Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Pecha.Button
          type="button"
          disabled={disabled || isPending}
          variant="destructive"
          className="cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoMdAdd className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPending ? "Adding..." : "Add New Day"}
          </span>
        </Pecha.Button>
      </DialogTrigger>

      <Pecha.DialogContent className="max-w-md">
        <Pecha.DialogHeader>
          <Pecha.DialogTitle>Add Days</Pecha.DialogTitle>
          <DialogDescription>
            Add one or more new days to this plan. Optionally copy tasks from an
            existing day.
          </DialogDescription>
        </Pecha.DialogHeader>

        <div className="space-y-5 py-1">
          {/* Number of days */}
          <div className="space-y-2">
            <label htmlFor="num-days-input" className="text-sm font-medium">
              Number of days
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease"
                disabled={numberOfDays <= 1}
                className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onClick={() => setNumberOfDays((n) => Math.max(1, n - 1))}
              >
                <IoMdRemove className="w-4 h-4" />
              </button>
              <Input
                id="num-days-input"
                type="number"
                min={1}
                max={365}
                value={numberOfDays}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(v) && v >= 1)
                    setNumberOfDays(Math.min(365, v));
                }}
                className="w-20 text-center"
              />
              <button
                type="button"
                aria-label="Increase"
                disabled={numberOfDays >= 365}
                className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onClick={() => setNumberOfDays((n) => Math.min(365, n + 1))}
              >
                <IoMdAdd className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Template section */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <p className="text-sm font-medium">
              Copy tasks from a day{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </p>

            {/* Plan search */}
            <div ref={containerRef} className="space-y-2">
              <p className="text-xs text-muted-foreground">Plan</p>
              <div className="relative">
                <Input
                  placeholder="Search plans…"
                  className="bg-background pr-8"
                  value={planInputValue}
                  autoComplete="off"
                  onChange={(e) => {
                    setPlanSearch(e.target.value);
                    setShowPlanPicker(true);
                  }}
                  onFocus={() => {
                    setPlanSearch("");
                    setShowPlanPicker(true);
                  }}
                />
                {templatePlanId && !showPlanPicker && (
                  <button
                    type="button"
                    aria-label="Clear plan"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={clearPlan}
                  >
                    <IoMdClose className="h-4 w-4" />
                  </button>
                )}
                {showPlanDropdown && (
                  <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-white dark:bg-[#1e1e1e] shadow-md py-1">
                    {isPlanFetching && planOptions.length === 0 && (
                      <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Searching plans…
                      </li>
                    )}
                    {planOptions.map((plan) => (
                      <li key={plan.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            selectPlan(plan.id, plan.title, plan.language)
                          }
                        >
                          <span className="block truncate">{plan.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatPlanLanguage(plan.language)} · {plan.total_days}{" "}
                            {plan.total_days === 1 ? "day" : "days"}
                          </span>
                        </button>
                      </li>
                    ))}
                    {!isPlanFetching &&
                      planOptions.length === 0 &&
                      debouncedPlanSearch.trim().length > 0 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">
                          No plans found
                        </li>
                      )}
                    {!isPlanFetching &&
                      planOptions.length === 0 &&
                      debouncedPlanSearch.trim().length === 0 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground">
                          Start typing to search plans
                        </li>
                      )}
                  </ul>
                )}
              </div>

              {/* Day selector */}
              {templatePlanId && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Source day</p>
                  {isTemplatePlanFetching ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Loading days…
                    </div>
                  ) : (
                    <Pecha.Select
                      value={sourceDayId ?? ""}
                      onValueChange={(v) =>
                        setSourceDayId(v === "" ? undefined : v)
                      }
                    >
                      <Pecha.SelectTrigger className="bg-background">
                        <Pecha.SelectValue placeholder="Select a day…" />
                      </Pecha.SelectTrigger>
                      <Pecha.SelectContent>
                        {templateDays.map((day) => {
                          return (
                            <Pecha.SelectItem key={day.id} value={day.id}>
                              Day {day.day_number}
                            </Pecha.SelectItem>
                          );
                        })}
                        {templateDays.length === 0 && (
                          <Pecha.SelectItem value="" disabled>
                            No days in this plan
                          </Pecha.SelectItem>
                        )}
                      </Pecha.SelectContent>
                    </Pecha.Select>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Pecha.Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Pecha.Button>
          <Pecha.Button
            type="button"
            disabled={isPending}
            className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
            onClick={handleSubmit}
          >
            {isPending ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              addLabel
            )}
          </Pecha.Button>
        </DialogFooter>
      </Pecha.DialogContent>
    </Pecha.Dialog>
  );
};

export default DayCreateDialog;
