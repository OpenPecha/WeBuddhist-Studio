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
import { IoMdAdd, IoMdSearch } from "react-icons/io";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { BACKEND_BASE_URL } from "@/lib/constant";
import { Link } from "react-router-dom";

const fetchPlans = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string,
) => {
  const skip = (page - 1) * limit;
  const accessToken = sessionStorage.getItem('accessToken');
  const { data } = await axiosInstance.get(
    `${BACKEND_BASE_URL}/api/v1/cms/plan`,
    {
      headers:{
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        skip,
        limit,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    },
  );
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
      fetchPlans(currentPage, 20, debouncedSearch, sortBy, sortOrder),
    refetchOnWindowFocus: false,
    enabled: true,
    retry: false,
  });

  const totalPages = planData ? Math.ceil(planData.total / 20) : 1;

  return (
    <div className="w-full h-full font-dynamic px-10 pt-10">
      <div className="mb-4 flex items-center gap-4">
        <div className="border w-fit px-2 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
          <IoMdSearch className="w-4 h-4" />
          <Input
            placeholder={t("common.placeholder.search")}
            className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/create-plan/new">
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
            <IoMdAdd /> Add Plan
          </Button>
        </Link>
      </div>

      <DashBoardTable
        plans={planData?.plan}
        t={t}
        isLoading={isLoading}
        error={error}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {!error && (
        <div>
          <Pagination className="mt-4">
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.max(1, prev - 1));
              }}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
            <PaginationContent className="mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPage(pageNum);
                      }}
                      className={
                        currentPage === pageNum
                          ? "bg-primary text-white dark:bg-primary/10"
                          : "cursor-pointer"
                      }
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
            </PaginationContent>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((prev) => Math.min(totalPages, prev + 1));
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
