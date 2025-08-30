import { Input } from "@/components/ui/atoms/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/atoms/pagination";
import { DashBoardTable } from "@/components/ui/molecules/dashboard-table/DashBoardTable";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";

const fetchPlans = async (page: number, limit: number, search?: string) => {
  const { data } = await axiosInstance.get(`${BACKEND_BASE_URL}/api/v1/plans`, {
    params: {
      page,
      limit,
      search,
    },
  });
  return data;
};
const plansData = [
  {
    id: "1",
    coverImage:
      "https://ep-space.nyc3.cdn.digitaloceanspaces.com/app/uploads/2021/03/21161102/4-5dllc1155insidetengboche7-5x5cpywrt-2.jpg",
    title: "The 7 day buddhist Plan on Compassion",
    subtitle:
      "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand",
    planDay: "7 Days",
    planUsed: "30 Used",
    status: "In Draft",
  },
  {
    id: "2",
    coverImage:
      "https://ep-space.nyc3.cdn.digitaloceanspaces.com/app/uploads/2021/03/21161102/4-5dllc1155insidetengboche7-5x5cpywrt-2.jpg",
    title: "The 7 day buddhist Plan on Compassion",
    subtitle:
      "this plan is for the people to learn and study about compassion in a boarder context of how we perceive it. the greatest way to do this is to understand",
    planDay: "7 Days",
    planUsed: "30 Used",
    status: "Published",
  },
];

const Dashboard = () => {
  const { t } = useTranslate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); //current: static
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: listPlans, isLoading, error } = useQuery({
    queryKey: ["dashboard-plans", currentPage, debouncedSearch],
    queryFn: () => fetchPlans(currentPage, 20, debouncedSearch || undefined),
    refetchOnWindowFocus: false,
    enabled: false, //TODO: need to change to true when api is ready
  });

  let displayPlans = plansData;

  if (listPlans?.items) {
    displayPlans = listPlans.items.map((plan: any) => ({
      id: plan.id,
      coverImage: plan.image_url,
      title: plan.title,
      subtitle: plan.description,
      planDay: `${plan.plan_days} Days`,
      planUsed: `${plan.plan_used_count} Used`,
      status: plan.is_active ? "Published" : "In Draft",
    }));
  } else if (debouncedSearch && !listPlans) {
    displayPlans = plansData.filter(
      (plan) =>
        plan.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        plan.subtitle.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }
  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-4">Error fetching plans</div>;
  }
  return (
    <div className="w-full h-full font-dynamic px-10 pt-10">
      <div className="mb-4 flex items-center gap-4">
        <div className="border w-fit px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center ">
          <Search className="w-4 h-4" />
          <Input
            placeholder={t("common.placeholder.search")}
            className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
          <Plus /> Add Plan
        </Button>
      </div>
      <DashBoardTable plans={displayPlans} t={t} />
      <Pagination className="mt-4">
        <PaginationPrevious />
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext />
      </Pagination>
    </div>
  );
};

export default Dashboard;
