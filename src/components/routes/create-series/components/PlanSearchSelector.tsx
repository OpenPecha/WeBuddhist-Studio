import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";

// TODO: Replace with real plan search API once endpoint is ready.
type MockPlan = {
  id: string;
  title: string;
  image_url: string;
};

const MOCK_PLANS: MockPlan[] = [
  {
    id: "plan-1",
    title: "Abhidhamma Part 1",
    image_url: "https://placehold.co/40x40",
  },
  {
    id: "plan-2",
    title: "Abhidhamma Part 2",
    image_url: "https://placehold.co/40x40",
  },
  {
    id: "plan-3",
    title: "Abhidhamma in Everyday Life",
    image_url: "https://placehold.co/40x40",
  },
  {
    id: "plan-4",
    title: "Abhidhamma Teaching 1",
    image_url: "https://placehold.co/40x40",
  },
  {
    id: "plan-5",
    title: "Abhidhamma Teaching 2",
    image_url: "https://placehold.co/40x40",
  },
  {
    id: "plan-6",
    title: "Introduction to Buddhism",
    image_url: "https://placehold.co/40x40",
  },
];

type PlanSearchSelectorProps = {
  value: string[];
  onChange: (planIds: string[]) => void;
};

const PlanSearchSelector = ({ value, onChange }: PlanSearchSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // TODO: Replace with real API call (debounced).
  const searchResults = searchQuery.trim()
    ? MOCK_PLANS.filter((plan) =>
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : [];

  // Build lookup of added plans for rendering the list (with thumbnail + title).
  const addedPlans = MOCK_PLANS.filter((plan) => value.includes(plan.id));

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

        {isDropdownOpen && searchQuery.trim() && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background dark:bg-[#262626] shadow-md max-h-60 overflow-auto">
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
          </div>
        )}

        {isDropdownOpen && searchQuery.trim() && searchResults.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background dark:bg-[#262626] shadow-md p-3">
            <p className="text-sm text-muted-foreground">No plans found</p>
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