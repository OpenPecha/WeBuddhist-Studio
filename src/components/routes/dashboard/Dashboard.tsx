import { Pecha } from "@/components/ui/shadimport";
import { DashboardContentTable } from "@/components/routes/dashboard/DashboardContentTable";
import {
  fetchDashboardItems,
  type DashboardTab,
} from "@/components/routes/dashboard/dashboardApi";
import type { DashboardRowKind } from "@/components/routes/dashboard/dashboardTable";
import {
  buildDashboardSearchParams,
  dashboardUrlStateToFetchParams,
  mergeDashboardUrlState,
  parseDashboardSearchParams,
  type DashboardPlanStatus,
  type DashboardSort,
  type DashboardUrlState,
} from "@/components/routes/dashboard/dashboardUrlState";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Activity,
  type ReactNode,
} from "react";
import { useDebounce } from "use-debounce";
import { useTolgee, useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/atoms/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { Link, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { toast } from "sonner";

const SEARCH_DEBOUNCE_MS = 500;

const toggleFeatured = async ({
  id,
  kind,
  featured,
}: {
  id: string;
  kind: DashboardRowKind;
  featured: boolean;
}) => {
  if (kind === "series") {
    const { data } = await axiosInstance.put(`/api/v1/cms/series/${id}`, {
      featured: !featured,
    });
    return data;
  }
  const { data } = await axiosInstance.patch(
    `/api/v1/cms/plans/${id}/featured`,
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
  const tolgee = useTolgee(["language"]);
  const localeLanguage = tolgee.getLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlState = useMemo(
    () => parseDashboardSearchParams(searchParams),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(urlState.search ?? "");
  const [debouncedSearchDraft] = useDebounce(searchDraft, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSearchDraft(urlState.search ?? "");
  }, [urlState.search]);

  const replaceUrlState = useCallback(
    (patch: Partial<DashboardUrlState>) => {
      const next = mergeDashboardUrlState(urlState, patch);
      setSearchParams(buildDashboardSearchParams(next), { replace: true });
    },
    [urlState, setSearchParams],
  );

  const resetPageFilters = { page: 1 as const };

  useEffect(() => {
    const trimmed = debouncedSearchDraft.trim();
    const committed = urlState.search ?? "";
    if (trimmed === committed) return;
    replaceUrlState({
      search: trimmed || null,
      ...resetPageFilters,
    });
  }, [debouncedSearchDraft, urlState.search, replaceUrlState]);

  const fetchParams = useMemo(
    () => ({
      ...dashboardUrlStateToFetchParams(urlState),
      localeLanguage,
    }),
    [urlState, localeLanguage],
  );

  const {
    data: dashboardData,
    status,
    isFetching,
    error,
    isError,
  } = useQuery({
    queryKey: ["dashboard-items", fetchParams],
    queryFn: () => fetchDashboardItems(fetchParams),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const totalPages = dashboardData?.pagination.total_pages ?? 1;

  useEffect(() => {
    if (status !== "success") return;
    if (urlState.page > totalPages && totalPages > 0) {
      replaceUrlState({ page: totalPages });
    }
  }, [status, urlState.page, totalPages, replaceUrlState]);

  const queryClient = useQueryClient();
  const featuredMutation = useMutation({
    mutationFn: toggleFeatured,
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

  const handleFeatured = (
    id: string,
    kind: DashboardRowKind,
    featured: boolean,
  ) => {
    featuredMutation.mutate({ id, kind, featured });
  };

  const setTab = (next: DashboardTab) => {
    replaceUrlState({ tab: next, ...resetPageFilters });
  };

  const rows = dashboardData?.rows ?? [];
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
    urlState.tab === "plans"
      ? t("studio.dashboard.no_plan_found")
      : urlState.tab === "series"
        ? "No series found."
        : "Nothing to show yet";

  const emptyDescription =
    urlState.tab === "plans"
      ? "Create a plan to see it listed here."
      : urlState.tab === "series"
        ? "Create a series to see it listed here."
        : "Try clearing search or add new plans and series.";

  const sortValue: DashboardSort = urlState.sort ?? "recent";

  const filterBar = (
    <div className="flex w-full flex-wrap items-end gap-4 px-4 pb-2 pt-3">
      <div className="flex min-w-[180px] flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Sort</span>
        <Pecha.Select
          value={sortValue}
          onValueChange={() => {
            // Backend sort is fixed; keep URL clean (omit `sort` = default).
            replaceUrlState({ sort: null });
          }}
        >
          <Pecha.SelectTrigger className="h-9 w-[200px] bg-white dark:bg-input/30">
            <Pecha.SelectValue placeholder="Sort" />
          </Pecha.SelectTrigger>
          <Pecha.SelectContent>
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
          value={urlState.language || "all"}
          onValueChange={(v) => {
            replaceUrlState({
              language: v === "all" ? null : v,
              ...resetPageFilters,
            });
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
          value={urlState.status || "all"}
          onValueChange={(v) => {
            replaceUrlState({
              status: v === "all" ? null : (v as DashboardPlanStatus),
              ...resetPageFilters,
            });
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
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
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
                <Link to={ROUTES.seriesNew}>
                  <Pecha.DropdownMenuItem>Add Series</Pecha.DropdownMenuItem>
                </Link>
                <Link to={ROUTES.planNew}>
                  <Pecha.DropdownMenuItem>Add Plan</Pecha.DropdownMenuItem>
                </Link>
              </Pecha.DropdownMenuGroup>
            </Pecha.DropdownMenuContent>
          </Pecha.DropdownMenu>

          <div className="flex flex-wrap items-center gap-2 pl-1">
            <button
              type="button"
              className={chipClass(urlState.tab === "all")}
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              type="button"
              className={chipClass(urlState.tab === "plans")}
              onClick={() => setTab("plans")}
            >
              Plans
            </button>
            <button
              type="button"
              className={chipClass(urlState.tab === "series")}
              onClick={() => setTab("series")}
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
        {isError && error && (
          <DashboardListPlaceholder
            title="Unable to load dashboard"
            description={String(error.message)}
          />
        )}
        {showEmpty && (
          <DashboardListPlaceholder
            title={emptyTitle}
            description={emptyDescription}
          >
            <Link to={ROUTES.planNew}>
              <Pecha.Button variant="outline" size="sm">
                <IoMdAdd className="h-4 w-4" /> {t("studio.dashboard.add_plan")}
              </Pecha.Button>
            </Link>
            <Link to={ROUTES.seriesNew}>
              <Pecha.Button variant="outline" size="sm">
                <IoMdAdd className="h-4 w-4" /> Add Series
              </Pecha.Button>
            </Link>
          </DashboardListPlaceholder>
        )}
        {!isError && !showEmpty && (
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
          currentPage={urlState.page}
          totalPages={totalPages}
          onPageChange={(nextPage) => replaceUrlState({ page: nextPage })}
        />
      </Activity>
    </div>
  );
};

export default Dashboard;
