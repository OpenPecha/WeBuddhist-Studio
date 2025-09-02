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
import { Link } from "react-router-dom";

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
  const [debouncedSearch] = useDebounce(search, 500);

  const filteredPlans = plansData.filter(
    (plan) =>
      plan.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      plan.subtitle.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

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
        <Link to="/create-plan">
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
            <Plus /> Add Plan
          </Button>
        </Link>
      </div>
      <DashBoardTable plans={filteredPlans} t={t} />
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
