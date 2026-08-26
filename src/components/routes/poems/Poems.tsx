import { useState } from "react";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { useDebounce } from "use-debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import AuthButton from "@/components/ui/molecules/auth-button/AuthButton";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { fetchPoemsList, deletePoem, type PoemItem } from "./api/poemApi";
import PoemsList from "./PoemsList";
import PoemFormDialog from "./PoemFormDialog";

const PAGE_SIZE = 10;

const Poems = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 500);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PoemItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PoemItem | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["poems-list", currentPage, debouncedSearch],
    queryFn: () =>
      fetchPoemsList({
        page: currentPage,
        limit: PAGE_SIZE,
        authorName: debouncedSearch,
      }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const invalidatePoems = () => {
    queryClient.invalidateQueries({ queryKey: ["poems-list"] });
  };

  const deleteMutation = useMutation({
    mutationFn: deletePoem,
    onSuccess: () => {
      toast.success("Poem deleted successfully!");
      setDeleteTarget(null);
      if (data?.poems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      invalidatePoems();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
      setDeleteTarget(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: PoemItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
    invalidatePoems();
  };

  const poems = data?.poems ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F5F5F5] dark:bg-[#181818] font-dynamic">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-[#313132] bg-white dark:bg-[#1E1E1E]">
        <div className="flex items-center space-x-2">
          <div className="border w-fit px-2 bg-white dark:bg-input/30 rounded-md border-gray-200 dark:border-[#313132] flex items-center">
            <IoMdSearch className="w-4 h-4" />
            <Pecha.Input
              placeholder="Search by author..."
              className="rounded-md border-none dark:bg-transparent px-4 shadow-none py-2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (currentPage !== 1) setCurrentPage(1);
              }}
            />
          </div>
          <Button
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
            onClick={handleOpenCreate}
          >
            <IoMdAdd /> Add Poem
          </Button>
        </div>
        <AuthButton />
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        {error ? (
          <p className="text-sm text-red-500 py-8">
            Failed to load poems. {getApiErrorMessage(error)}
          </p>
        ) : poems.length === 0 && !isLoading ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-base text-muted-foreground">No poems found</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={handleOpenCreate}
            >
              <IoMdAdd /> Add Poem
            </Button>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <PoemsList
              poems={poems}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
      </div>

      {poems.length > 0 && (
        <div className="border-t border-gray-200 dark:border-[#313132] px-6 py-4 bg-white dark:bg-[#1E1E1E]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <PoemFormDialog
        open={formOpen}
        onOpenChange={(open: boolean) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={handleFormSuccess}
      />

      <Pecha.AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete Poem</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-[#AD1B21] dark:text-white hover:bg-[#AD1B21]/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default Poems;
