import { Pecha } from "@/components/ui/shadimport";
import { DashBoardTable } from "@/components/ui/molecules/dashboard-table/DashBoardTable";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useState, Activity } from "react";
import { useDebounce } from "use-debounce";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";

const fetchPlans = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
) => {
  const skip = (page - 1) * limit;
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/plans`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      skip,
      limit,
      ...(search && { search }),
      ...(sortBy && { sort_by: sortBy }),
      ...(sortOrder && { sort_order: sortOrder }),
    },
  });
  return data;
};

const Dashboard = () => {
  const { t } = useTranslate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 500);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  const {
    data: planData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "dashboard-plans",
      currentPage,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchPlans(currentPage, 10, debouncedSearch, sortBy, sortOrder),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const totalPages = planData ? Math.ceil(planData.total / 10) : 1;

  return (
    <div className=" border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic ">
      <div className="mb-4  px-4 pt-10 flex items-center justify-between">
        <div className="flex  items-center space-x-2">
          <div className="border w-fit px-2 bg-white dark:bg-input/30 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4" />
            <Pecha.Input
              placeholder={t("common.placeholder.search")}
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/plan/new">
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
              <IoMdAdd /> Add Plan
            </Button>
          </Link>
        </div>
        <AuthButton />
      </div>
      <div className="border-b  w-full border-dashed border-gray-300 dark:border-input" />
      <div className="w-full px-4 pt-4 flex flex-col items-center justify-between">
        <DashBoardTable
          plans={planData?.plans}
          t={t}
          isLoading={isLoading}
          error={error}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
      <Activity mode={planData?.plans?.length > 0 ? "visible" : "hidden"}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Activity>
    </div>
  );
};

export default Dashboard;
