import { Pecha } from "@/components/ui/shadimport";
import { DashboardContentTable } from "@/components/routes/dashboard/DashboardContentTable";
import {
  DASHBOARD_PAGE_SIZE,
  fetchDashboardItems,
  type DashboardTab,
} from "@/components/routes/dashboard/dashboardApi";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useState, Activity, type ReactNode } from "react";
import { useDebounce } from "use-debounce";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { toast } from "sonner";

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

function DashboardListPlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/80 px-8 py-16 text-center dark:border-[#313132] dark:bg-[#1d1d1f]/80">
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

const Dashboard = () => {
  const { t } = useTranslate();
  const [view, setView] = useState<DashboardTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 500);
  const [sortBy, setSortBy] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const setViewAndReset = (next: DashboardTab) => {
    setView(next);
    setPage(1);
    setLanguageFilter("");
    setStatusFilter("");
  };

  const {
    data: dashboardData,
    status,
    isFetching,
    error,
    isError,
  } = useQuery({
    queryKey: [
      "dashboard-items",
      view,
      page,
      debouncedSearch,
      languageFilter,
      statusFilter,
      sortBy,
    ],
    queryFn: () =>
      fetchDashboardItems({
        tab: view,
        page,
        pageSize: DASHBOARD_PAGE_SIZE,
        search: debouncedSearch,
        ...(languageFilter && { language: languageFilter }),
        ...(statusFilter && { status: statusFilter }),
      }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const queryClient = useQueryClient();
  const featuredMutation = useMutation({
    mutationFn: (planId: string) => toggleFeatured(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-items"] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: { message?: string } } } })
          ?.response?.data?.detail?.message ?? "Could not update featured";
      toast.error(message);
    },
  });

  const handleFeatured = (planId: string) => {
    featuredMutation.mutate(planId);
  };

  const rows = dashboardData?.rows ?? [];
  const totalPages = dashboardData?.pagination.total_pages ?? 1;
  const hasRows = rows.length > 0;
  const isLoadingTable = status === "pending" || isFetching;
  const showEmpty = status === "success" && !hasRows;

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-[#313132] dark:bg-transparent dark:text-gray-200 dark:hover:bg-[#2a2a2a]"
    }`;

  const emptyTitle =
    view === "plans"
      ? t("studio.dashboard.no_plan_found")
      : view === "series"
        ? "No series found."
        : "Nothing to show yet";

  const emptyDescription =
    view === "plans"
      ? "Create a plan to see it listed here."
      : view === "series"
        ? "Create a series to see it listed here."
        : "Try clearing search or add new plans and series.";

  const filterBar = (
    <div className="flex w-full flex-wrap items-end gap-4 px-4 pb-2 pt-3">
      <div className="flex min-w-[180px] flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Sort</span>
        <Pecha.Select defaultValue="recent">
          <Pecha.SelectTrigger className="h-9 w-[200px] bg-white dark:bg-input/30">
            <Pecha.SelectValue placeholder="Sort" />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent onClick={() => setSortBy("recent")}>
            <Pecha.SelectItem value="recent">
              Recently modified
            </Pecha.SelectItem>
          </Pecha.SelectContent>
        </Pecha.Select>
      </div>
      <div className="flex min-w-[160px] flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Language
        </span>
        <Pecha.Select
          value={languageFilter || "all"}
          onValueChange={(v) => {
            setLanguageFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <Pecha.SelectTrigger className="h-9 w-[180px] bg-white dark:bg-input/30">
            <Pecha.SelectValue placeholder="Language" />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            <Pecha.SelectItem value="all">All languages</Pecha.SelectItem>
            <Pecha.SelectItem value="EN">English</Pecha.SelectItem>
            <Pecha.SelectItem value="ZH">中国人</Pecha.SelectItem>
            <Pecha.SelectItem value="BO">བོད་སྐད།</Pecha.SelectItem>
          </Pecha.SelectContent>
        </Pecha.Select>
      </div>
      <div className="flex min-w-[160px] flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Status
        </span>
        <Pecha.Select
          value={statusFilter || "all"}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <Pecha.SelectTrigger className="h-9 w-[200px] bg-white dark:bg-input/30">
            <Pecha.SelectValue placeholder="Status" />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
            <Pecha.SelectItem value="all">All statuses</Pecha.SelectItem>
            <Pecha.SelectItem value="DRAFT">Draft</Pecha.SelectItem>
            <Pecha.SelectItem value="PUBLISHED">Published</Pecha.SelectItem>
            <Pecha.SelectItem value="UNPUBLISHED">Unpublished</Pecha.SelectItem>
            <Pecha.SelectItem value="ARCHIVED">Archived</Pecha.SelectItem>
          </Pecha.SelectContent>
        </Pecha.Select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl font-dynamic">
      <div className="mb-4 px-4 pt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="border w-fit px-2 bg-white dark:bg-input/30 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4 shrink-0" />
            <Pecha.Input
              placeholder={t("common.placeholder.search")}
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Pecha.DropdownMenu>
            <Pecha.DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-gray-200 bg-white hover:bg-gray-50 dark:border-[#313132] dark:bg-transparent dark:hover:bg-[#2a2a2a]"
                aria-label="Add"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A51C21] text-white">
                  <IoMdAdd className="h-4 w-4" aria-hidden />
                </span>
                Add
              </Button>
            </Pecha.DropdownMenuTrigger>
            <Pecha.DropdownMenuContent align="start">
              <Pecha.DropdownMenuGroup>
                <Link to="/series/new">
                  <Pecha.DropdownMenuItem>Add Series</Pecha.DropdownMenuItem>
                </Link>
                <Link to="/plan/new">
                  <Pecha.DropdownMenuItem>Add Plan</Pecha.DropdownMenuItem>
                </Link>
              </Pecha.DropdownMenuGroup>
            </Pecha.DropdownMenuContent>
          </Pecha.DropdownMenu>

          <div className="flex flex-wrap items-center gap-2 pl-1">
            <button
              type="button"
              className={chipClass(view === "all")}
              onClick={() => setViewAndReset("all")}
            >
              All
            </button>
            <button
              type="button"
              className={chipClass(view === "plans")}
              onClick={() => setViewAndReset("plans")}
            >
              Plans
            </button>
            <button
              type="button"
              className={chipClass(view === "series")}
              onClick={() => setViewAndReset("series")}
            >
              Series
            </button>
          </div>
        </div>
        <AuthButton />
      </div>
      <div className="border-b w-full border-dashed border-gray-300 dark:border-input" />
      {filterBar}

      <div className="flex flex-1 flex-col items-center px-4 pb-6 pt-2">
        {isError && error ? (
          <DashboardListPlaceholder
            title="Unable to load dashboard"
            description={String(error.message)}
          />
        ) : showEmpty ? (
          <DashboardListPlaceholder
            title={emptyTitle}
            description={emptyDescription}
          >
            <Link to="/plan/new">
              <Pecha.Button variant="outline" size="sm">
                <IoMdAdd className="h-4 w-4" /> {t("studio.dashboard.add_plan")}
              </Pecha.Button>
            </Link>
            <Link to="/series/new">
              <Pecha.Button variant="outline" size="sm">
                <IoMdAdd className="h-4 w-4" /> Add Series
              </Pecha.Button>
            </Link>
          </DashboardListPlaceholder>
        ) : (
          <div className="w-full overflow-x-auto">
            <DashboardContentTable
              rows={rows}
              isLoading={isLoadingTable}
              t={t}
              handleFeatured={handleFeatured}
            />
          </div>
        )}
      </div>

      <Activity mode={hasRows ? "visible" : "hidden"}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Activity>
    </div>
  );
};

export default Dashboard;
