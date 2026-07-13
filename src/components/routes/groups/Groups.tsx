import { useEffect, useState } from "react";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useDebounce } from "use-debounce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";
import {
  fetchGroups,
  GROUP_TYPE_OPTIONS,
  type AuthorGroupType,
} from "./api/groupsApi";
import { GroupListShell } from "./components/GroupPageShell";
import GroupsList from "./GroupsList";
import PendingGroupInvitationsBlock from "./components/PendingGroupInvitationsBlock";

const PAGE_SIZE = 10;

function GroupsLoadMoreStatus({
  isFetchingNextPage,
  hasNextPage,
  hasGroups,
}: Readonly<{
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasGroups: boolean;
}>) {
  if (isFetchingNextPage) {
    return <p className="text-sm text-muted-foreground">Loading more…</p>;
  }
  if (hasNextPage) {
    return <span className="h-4" aria-hidden />;
  }
  if (hasGroups) {
    return <p className="text-sm text-muted-foreground">All groups loaded</p>;
  }
  return null;
}

const Groups = () => {
  const [search, setSearch] = useState("");
  const [groupType, setGroupType] = useState<AuthorGroupType | "">("COMMUNITY");
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["cms-groups", debouncedSearch, groupType],
    queryFn: ({ pageParam }) =>
      fetchGroups({
        page: pageParam,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        group_type: groupType || undefined,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.groups.length,
        0,
      );
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const groups = data?.pages.flatMap((page) => page.groups) ?? [];
  const isEmpty = groups.length === 0 && !isLoading;

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  let listContent;
  if (error) {
    listContent = (
      <p className="text-sm text-red-500 py-8">
        Failed to load groups. {getApiErrorMessage(error)}
      </p>
    );
  } else if (isEmpty) {
    listContent = (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-base text-muted-foreground">No groups found</p>
        <Button variant="outline" className="mt-2" asChild>
          <Link to={ROUTES.groupNew}>
            <IoMdAdd /> Create group
          </Link>
        </Button>
      </div>
    );
  } else {
    listContent = (
      <>
        <GroupsList groups={groups} isLoading={isLoading} />
        <div ref={sentinelRef} className="w-full py-4 flex justify-center">
          <GroupsLoadMoreStatus
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={Boolean(hasNextPage)}
            hasGroups={groups.length > 0}
          />
        </div>
      </>
    );
  }

  return (
    <GroupListShell
      toolbar={
        <div className="mb-4 px-4 pt-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <div className="border w-fit px-2 bg-white dark:bg-input/30 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
              <IoMdSearch className="w-4 h-4" />
              <Pecha.Input
                placeholder="Search groups…"
                className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Pecha.Select
              value={groupType || "all"}
              onValueChange={(v) =>
                setGroupType(v === "all" ? "" : (v as AuthorGroupType))
              }
            >
              <Pecha.SelectTrigger className="w-36 bg-white dark:bg-input/30">
                <Pecha.SelectValue placeholder="Type" />
              </Pecha.SelectTrigger>
              <Pecha.SelectContent>
                <Pecha.SelectItem value="all">All types</Pecha.SelectItem>
                {GROUP_TYPE_OPTIONS.map((option) => (
                  <Pecha.SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </Pecha.SelectItem>
                ))}
              </Pecha.SelectContent>
            </Pecha.Select>

            <Button
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200"
              asChild
            >
              <Link to={ROUTES.groupNew}>
                <IoMdAdd /> New group
              </Link>
            </Button>
          </div>
          <AuthButton />
        </div>
      }
    >
      <div className="px-4 pt-4 h-full flex flex-col items-center flex-1 min-h-0">
        {listContent}
      </div>
      <PendingGroupInvitationsBlock />
    </GroupListShell>
  );
};

export default Groups;
