import { useState, Activity } from "react";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { PLAN_LANGUAGE } from "@/lib/constant";
import { ROUTES } from "@/routes/paths";
import { fetchGroups } from "./api/groupsApi";
import { fetchTags } from "@/components/routes/tags/api/tagsApi";
import { GroupListShell } from "./components/GroupPageShell";
import GroupsTable from "./GroupsTable";
import PendingGroupInvitationsBlock from "./components/PendingGroupInvitationsBlock";

const PAGE_SIZE = 10;

const Groups = () => {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [tagId, setTagId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    data: groupsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cms-groups", currentPage, debouncedSearch, language, tagId],
    queryFn: () =>
      fetchGroups({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        language: language || undefined,
        tag_id: tagId || undefined,
      }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["cms-tags-filter"],
    queryFn: () => fetchTags(1, 100, ""),
    refetchOnWindowFocus: false,
  });

  const totalPages = groupsData ? Math.ceil(groupsData.total / PAGE_SIZE) : 1;

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (currentPage !== 1) setCurrentPage(1);
                }}
              />
            </div>

            <Pecha.Select
              value={language || "all"}
              onValueChange={(v) => {
                setLanguage(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <Pecha.SelectTrigger className="w-32 bg-white dark:bg-input/30">
                <Pecha.SelectValue placeholder="Language" />
              </Pecha.SelectTrigger>
              <Pecha.SelectContent>
                <Pecha.SelectItem value="all">All languages</Pecha.SelectItem>
                {PLAN_LANGUAGE.map((lang) => (
                  <Pecha.SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </Pecha.SelectItem>
                ))}
              </Pecha.SelectContent>
            </Pecha.Select>

            <Pecha.Select
              value={tagId || "all"}
              onValueChange={(v) => {
                setTagId(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <Pecha.SelectTrigger className="w-40 bg-white dark:bg-input/30">
                <Pecha.SelectValue placeholder="Tag" />
              </Pecha.SelectTrigger>
              <Pecha.SelectContent>
                <Pecha.SelectItem value="all">All tags</Pecha.SelectItem>
                {(tagsData?.tags ?? []).map((tag) => (
                  <Pecha.SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
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
      footer={
        <Activity mode={groupsData?.groups?.length ? "visible" : "hidden"}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Activity>
      }
    >
      <div className="px-4 pt-4 h-full flex flex-col items-center justify-between flex-1 min-h-0">
        {error ? (
          <p className="text-sm text-red-500 py-8">
            Failed to load groups. {getApiErrorMessage(error)}
          </p>
        ) : groupsData?.groups.length === 0 && !isLoading ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-base text-muted-foreground">No groups found</p>
            <Button variant="outline" className="mt-2" asChild>
              <Link to={ROUTES.groupNew}>
                <IoMdAdd /> Create group
              </Link>
            </Button>
          </div>
        ) : (
          <GroupsTable
            groups={groupsData?.groups ?? []}
            isLoading={isLoading}
          />
        )}
      </div>
      <PendingGroupInvitationsBlock />
    </GroupListShell>
  );
};

export default Groups;
