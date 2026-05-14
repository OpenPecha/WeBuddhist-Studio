import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { IoMdClose } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { searchPlans, type Plan } from "@/components/routes/create-series/api/planSearchApi";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

type PlanSearchSelectorProps = {
  value: string[];
  onChange: (planIds: string[]) => void;
  /**
   * Pre-existing plan objects for edit mode hydration.
   * In create mode this is empty; in edit mode the parent passes the plans
   * already attached to the series so we can render their thumbnails/titles without a lookup call.
   */
  initialPlans?: Plan[];
};

const PlanSearchSelector = ({
  value,
  onChange,
  initialPlans = [],
}: PlanSearchSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Local cache of plan objects we've seen (from search results + initialPlans).
  // Needed so we can render thumbnails/titles for plans in `value` even after the user clears the search query.
  const [knownPlans, setKnownPlans] = useState<Map<string, Plan>>(
    () => new Map(initialPlans.map((p) => [p.id, p])),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["search-plans", debouncedQuery],
    queryFn: ({ pageParam = 0 }) =>
      searchPlans({
        search: debouncedQuery || undefined,
        skip: pageParam,
        limit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      const fetched = lastPage.skip + lastPage.plans.length;
      return fetched < lastPage.total ? fetched : undefined;
    },
    initialPageParam: 0,
    enabled: debouncedQuery.length > 0 && isDropdownOpen,
  });

  const searchResults: Plan[] =
    data?.pages.flatMap((page) => page.plans) ?? [];

  useEffect(() => {
    if (searchResults.length === 0) return;
    setKnownPlans((prev) => {
      const next = new Map(prev);
      searchResults.forEach((plan) => next.set(plan.id, plan));
      return next;
    });
  }, [searchResults]);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addedPlans: Plan[] = value
    .map((id) => knownPlans.get(id))
    .filter((plan): plan is Plan => plan !== undefined);

  const handleTogglePlan = (planId: string) => {
    if (value.includes(planId)) {
      onChange(value.filter((id) => id !== planId));
    } else {
      onChange([...value, planId]);
    }
  };

  const handleRemovePlan = (planId: string) => {
    onChange(value.filter((id) => id !== planId));
  };

  const showDropdown = isDropdownOpen && debouncedQuery.length > 0;
  const showNoResults =
    showDropdown && !isLoading && searchResults.length === 0;

  return (
    <div className="border border-input rounded-md p-4 min-h-[280px] space-y-3">
      <div className="relative">
        <div className="relative">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find Plan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
            className="h-12 w-full rounded-md border border-input bg-white dark:bg-[#262626] dark:text-white pl-10 pr-3 text-base placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </div>

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background dark:bg-[#262626] shadow-md max-h-60 overflow-auto">
            {isLoading && searchResults.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {searchResults.map((plan) => {
              const isSelected = value.includes(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleTogglePlan(plan.id);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#333333] cursor-pointer"
                >
                  <span className="text-sm">{plan.title}</span>
                  {isSelected && (
                    <span className="text-sm text-foreground">✓</span>
                  )}
                </button>
              );
            })}

            {hasNextPage && (
              <div
                ref={sentinelRef}
                className="px-3 py-2 text-xs text-muted-foreground text-center"
              >
                {isFetchingNextPage ? "Loading more..." : ""}
              </div>
            )}

            {showNoResults && (
              <div className="px-3 py-2">
                <p className="text-sm text-muted-foreground">No plans found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-auto">
        {addedPlans.map((plan) => (
          <div
            key={plan.id}
            className="flex items-center gap-3 rounded-md border border-input bg-white dark:bg-[#262626] p-2"
          >
            <img
              src={plan.image_url}
              alt={plan.title}
              className="w-10 h-10 rounded object-cover"
            />
            <span className="flex-1 text-sm">{plan.title}</span>
            <button
              type="button"
              onClick={() => handleRemovePlan(plan.id)}
              aria-label={`Remove ${plan.title}`}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
            >
              <IoMdClose className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSearchSelector;