import { Pecha } from "@/components/ui/shadimport";
import { DashBoardTable } from "@/components/ui/molecules/dashboard-table/DashBoardTable";
import { SeriesTable, type SeriesRow } from "@/components/ui/molecules/series-table/SeriesTable";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useState, Activity } from "react";
import { useDebounce } from "use-debounce";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { toast } from "sonner";

const fetchSeries = async (
  page: number,
  limit: number,
  search: string,
): Promise<{ series: any[]; total: number; skip: number; limit: number; }> => {
  const skip = (page - 1) * limit;
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.get(`/api/v1/cms/series`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      skip,
      limit,
      ...(search && { search }),
    },
  });
  return data;
};

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

const toggleFeatured = async (planId: string) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const { data } = await axiosInstance.patch(
    `/api/v1/cms/plans/${planId}/featured`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
};

const Dashboard = () => {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<"plans" | "series">("series");
  const [search, setSearch] = useState("");
  const [plansPage, setPlansPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
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
    setPlansPage(1);
    setSeriesPage(1);
  };

  const getSeriesTitle = (name: any) => {
    if (!name) return "Untitled";
    if (typeof name === "string") return name;
    if (typeof name === "object") {
      const candidate =
        name.en ||
        name.EN ||
        name.bo ||
        name.BO ||
        name.zh ||
        name.ZH ||
        Object.values(name).find((v) => typeof v === "string");
      return (candidate as string) || "Untitled";
    }
    return "Untitled";
  };

  const seriesQuery = useQuery({
    queryKey: ["dashboard-series", seriesPage, debouncedSearch],
    queryFn: () => fetchSeries(seriesPage, 10, debouncedSearch),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: activeTab === "series",
  });

  const {
    data: planData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "dashboard-plans",
      plansPage,
      debouncedSearch,
      sortBy,
      sortOrder,
    ],
    queryFn: () => fetchPlans(plansPage, 10, debouncedSearch, sortBy, sortOrder),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: activeTab === "plans",
  });

  const queryClient = useQueryClient();
  const featuredMutation = useMutation({
    mutationFn: (planId: string) => toggleFeatured(planId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["dashboard-plans"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.detail.message);
    },
  });

  const handleFeatured = (planId: string) => {
    featuredMutation.mutate(planId);
  };

  const totalPlanPages = planData ? Math.ceil(planData.total / 10) : 1;
  const totalSeriesPages = seriesQuery.data
    ? Math.ceil(seriesQuery.data.total / 10)
    : 1;

  const series: seriesRow[] = (seriesQuery.data?.series || []).map(
    (s: any) => ({
      id: s.id,
      title: getSeriesTitle(s.name),
      total_days: s.total_days ?? 0,
      enrolled: s.subscription_count ?? 0,
      status: s.status ?? "DRAFT",
      language: "",
      featured: !!s.featured,
      plans: Array.isArray(s.plans)
        ? s.plans.map((p: any) => ({
          id: p.id || p.plan_id || crypto.randomUUID(),
          title: p.title || p.name || "Untitled",
        }))
        : [],
    }),
  );

  return (
    <div className="flex flex-col border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="mb-4  px-4 pt-10 flex items-center justify-between">
        <div className="flex  items-center space-x-2">
          <div className="border w-fit px-2 bg-white dark:bg-input/30 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4" />
            <Pecha.Input
              placeholder={t("common.placeholder.search")}
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPlansPage(1);
                setSeriesPage(1);
              }}
            />
          </div>

          <Pecha.DropdownMenu>
            <Pecha.DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200"
                aria-label="Add"
              >
                <IoMdAdd /> Add
              </Button>
            </Pecha.DropdownMenuTrigger>
            <Pecha.DropdownMenuContent align="start">
              <Pecha.DropdownMenuGroup>
                <Link to="/plan/new">
                  <Pecha.DropdownMenuItem>
                    Add Plan
                  </Pecha.DropdownMenuItem>
                </Link>
                <Link to="/series/new">
                  <Pecha.DropdownMenuItem>
                    Add Series
                  </Pecha.DropdownMenuItem>
                </Link>
              </Pecha.DropdownMenuGroup>
            </Pecha.DropdownMenuContent>
          </Pecha.DropdownMenu>
        </div>
        <AuthButton />
      </div>
      <div className="border-b  w-full border-dashed border-gray-300 dark:border-input" />
      <div className="px-4 pt-4">
        <div className="flex items-end gap-8 border-b border-gray-200 dark:border-[#313132]">
          <button
            type="button"
            onClick={() => setActiveTab("series")}
            className={`pb-2 text-sm cursor-pointer font-semibold transition-colors ${activeTab === "series"
              ? "text-[#A51C21] border-b-2 border-[#A51C21]"
              : "text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            Series
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`pb-2 text-sm cursor-pointer font-semibold transition-colors ${activeTab === "plans"
              ? "text-[#A51C21] border-b-2 border-[#A51C21]"
              : "text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            Plans
          </button>
        </div>
      </div>
      <div className="px-4 pt-4 h-full flex flex-col items-center justify-between">
        {activeTab === "plans" && planData?.plans.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-base text-muted-foreground">
              {t("studio.dashboard.no_plan_found")}
            </p>
            <Link to="/plan/new">
              <Pecha.Button variant="outline" className="mt-2">
                <IoMdAdd /> {t("studio.dashboard.add_plan")}
              </Pecha.Button>
            </Link>
          </div>
        ) : activeTab === "series" &&
          (seriesQuery.data?.series?.length || 0) === 0 &&
          !seriesQuery.isLoading ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-base text-muted-foreground">
              No series found.
            </p>
            <Link to="/series/new">
              <Pecha.Button variant="outline" className="mt-2">
                <IoMdAdd /> Add Series
              </Pecha.Button>
            </Link>
          </div>
        ) : activeTab === "plans" ? (
          <DashBoardTable
            plans={planData?.plans}
            t={t}
            isLoading={isLoading}
            error={error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            handleFeatured={handleFeatured}
          />
        ) : (
          <SeriesTable
            series={series}
            isLoading={seriesQuery.isLoading}
            error={seriesQuery.error}
            onDeleteSeries={() => {
              toast.message("Delete series", {
                description:
                  "Delete endpoint isn't documented yet; will be wired when available.",
              });
            }}
          />
        )}
      </div>

      <Activity
        mode={
          activeTab === "plans"
            ? planData?.plans?.length > 0
              ? "visible"
              : "hidden"
            : (seriesQuery.data?.series?.length || 0) > 0
              ? "visible"
              : "hidden"
        }
      >
        <Pagination
          currentPage={activeTab === "plans" ? plansPage : seriesPage}
          totalPages={activeTab === "plans" ? totalPlanPages : totalSeriesPages}
          onPageChange={activeTab === "plans" ? setPlansPage : setSeriesPage}
        />
      </Activity>
    </div>
  );
};

export default Dashboard;
