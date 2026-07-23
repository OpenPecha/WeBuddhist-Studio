import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import {
  deleteChantCollection,
  fetchChantCollections,
  type ChantCollectionDTO,
} from "./api/chantsApi";

const PAGE_SIZE = 20;

const GroupChantsPage = () => {
  const { groupId, myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ChantCollectionDTO | null>(
    null,
  );

  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-chant-collections", groupId, page],
    queryFn: () =>
      fetchChantCollections(groupId, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: false,
  });

  const collections = useMemo(() => data?.collections ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChantCollection(groupId, id),
    onSuccess: () => {
      toast.success("Collection deleted");
      setPendingDelete(null);
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collections", groupId],
      });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const columnCount = canWrite ? 3 : 2;

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell colSpan={columnCount}>Loading…</Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    if (isError) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell colSpan={columnCount} className="text-destructive">
            {getApiErrorMessage(error, "Could not load collections.")}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    if (collections.length === 0) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={columnCount}
            className="text-muted-foreground"
          >
            No chant collections yet.
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }
    return collections.map((collection) => (
      <Pecha.TableRow key={collection.id}>
        <Pecha.TableCell className="font-medium">
          <Link
            to={ROUTES.groupChant(groupId, collection.id)}
            className="flex items-center gap-3 hover:underline"
          >
            {collection.img_url ? (
              <img
                src={collection.img_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded bg-muted" />
            )}
            <span className="min-w-0 truncate">{collection.name}</span>
          </Link>
        </Pecha.TableCell>
        <Pecha.TableCell>
          {collection.item_count} item{collection.item_count === 1 ? "" : "s"}
        </Pecha.TableCell>
        {canWrite ? (
          <Pecha.TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Pecha.Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(ROUTES.groupChantEdit(groupId, collection.id))
                }
              >
                Edit
              </Pecha.Button>
              <Pecha.Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(collection)}
                aria-label={`Delete ${collection.name}`}
              >
                <IoMdTrash className="h-4 w-4" />
              </Pecha.Button>
            </div>
          </Pecha.TableCell>
        ) : null}
      </Pecha.TableRow>
    ));
  }, [
    isLoading,
    isError,
    error,
    collections,
    columnCount,
    canWrite,
    groupId,
    navigate,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Chants</h2>
        {canWrite ? (
          <Pecha.Button
            className="gap-1 bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
            onClick={() => navigate(ROUTES.groupChantNew(groupId))}
          >
            <IoMdAdd className="h-4 w-4" /> New collection
          </Pecha.Button>
        ) : null}
      </div>

      <div className="rounded-lg border">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Name</Pecha.TableHead>
              <Pecha.TableHead>Items</Pecha.TableHead>
              {canWrite ? (
                <Pecha.TableHead className="text-right">
                  Actions
                </Pecha.TableHead>
              ) : null}
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>{body}</Pecha.TableBody>
        </Pecha.Table>

        {totalPages > 1 ? (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <Pecha.AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Delete collection?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This will permanently remove &ldquo;
              {pendingDelete?.name ?? ""}&rdquo;. This action cannot be undone.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupChantsPage;
