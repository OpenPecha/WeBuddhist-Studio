import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { IoMdClose } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import {
  searchPlans,
  type Plan,
} from "@/components/routes/create-series/api/planSearchApi";
import type { SeriesPlan } from "@/schema/SeriesSchema";
import { NO_PROFILE_IMAGE } from "@/lib/constant";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 600;

function planToSeriesPlan(plan: Plan): SeriesPlan {
  return {
    id: plan.id,
    title: plan.title,
    image_url: plan.image_url || undefined,
  };
}

type PlanSearchSelectorProps = {
  value: SeriesPlan[];
  onChange: (plans: SeriesPlan[]) => void;
  searchLanguage?: string;
};

const PlanSearchSelector = ({
  value,
  onChange,
  searchLanguage,
}: PlanSearchSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["search-plans", debouncedQuery, searchLanguage],
      queryFn: ({ pageParam = 0 }) =>
        searchPlans({
          search: debouncedQuery || undefined,
          language: searchLanguage,
          skip: pageParam,
          limit: PAGE_SIZE,
        }),
      getNextPageParam: (lastPage) => {
        const fetched = lastPage.skip + lastPage.plans.length;
        return fetched < lastPage.total ? fetched : undefined;
      },
      initialPageParam: 0,
      enabled: isDropdownOpen,
    });

  const searchResults: Plan[] = data?.pages.flatMap((page) => page.plans) ?? [];

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const valueIds = new Set(value.map((p) => p.id));

  const handleTogglePlan = (plan: Plan) => {
    const id = plan.id;
    if (valueIds.has(id)) {
      onChange(value.filter((p) => p.id !== id));
    } else {
      onChange([...value, planToSeriesPlan(plan)]);
    }
  };

  const handleRemovePlan = (planId: string) => {
    onChange(value.filter((p) => p.id !== planId));
  };

  const showDropdown = isDropdownOpen;
  const showNoResults =
    showDropdown && !isLoading && searchResults.length === 0;

  return (
    <div className="border border-input rounded-md p-4 min-h-[200px] space-y-3 bg-white dark:bg-[#262626]">
      {value.length === 0 ? (
        <div className="rounded-md border border-dashed border-muted-foreground/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No plans added yet — use the search below to add plans to this series.
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-auto">
          {value.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center gap-3 rounded-md border border-input bg-white dark:bg-[#262626] p-2"
            >
              <img
                src={plan.image_url || NO_PROFILE_IMAGE}
                alt={plan.title}
                className="w-10 h-10 rounded object-cover shrink-0"
              />
              <span className="flex-1 text-sm">{plan.title}</span>
              <button
                type="button"
                onClick={() => handleRemovePlan(plan.id)}
                aria-label={`Remove ${plan.title}`}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 shrink-0"
              >
                <IoMdClose className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find plans to add"
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
              const isSelected = valueIds.has(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleTogglePlan(plan);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#333333] cursor-pointer"
                >
                  <img
                    src={plan.image_url || NO_PROFILE_IMAGE}
                    alt=""
                    className="w-9 h-9 rounded object-cover shrink-0"
                  />
                  <span className="text-sm flex-1">{plan.title}</span>
                  {isSelected && (
                    <span className="text-sm text-foreground shrink-0">✓</span>
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
    </div>
  );
};

export default PlanSearchSelector;
