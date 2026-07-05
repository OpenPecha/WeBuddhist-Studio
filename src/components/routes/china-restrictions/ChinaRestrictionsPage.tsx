import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd } from "react-icons/io";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import {
  DialogDescription,
  DialogFooter,
} from "@/components/ui/atoms/dialog";
import { Pagination } from "@/components/ui/molecules/pagination/Pagination";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { useUserInfo } from "@/hooks/useUserInfo";
import {
  canAccessAdminAuthors,
  isSuperAdmin,
} from "@/lib/platformAccess";
import { ROUTES } from "@/routes/paths";
import {
  createChinaRestrictedItem,
  deleteChinaRestrictedItem,
  fetchChinaRestrictedItems,
  RESTRICTED_ITEM_TYPES,
  type RestrictedItemType,
} from "./api/chinaRestrictionsApi";

const PAGE_SIZE = 20;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const formatItemType = (type: RestrictedItemType) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const ChinaRestrictionsPage = () => {
  const { data: userInfo } = useUserInfo();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<RestrictedItemType | "ALL">("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<RestrictedItemType>("PLAN");
  const [newItemId, setNewItemId] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const canAccess = Boolean(
    userInfo && canAccessAdminAuthors(userInfo.platform_role),
  );
  const writeEnabled = isSuperAdmin(userInfo?.platform_role);

  const { data, isLoading, error } = useQuery({
    queryKey: ["china-restrictions", page, typeFilter],
    queryFn: () =>
      fetchChinaRestrictedItems({
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        ...(typeFilter !== "ALL" && { item_type: typeFilter }),
      }),
    enabled: canAccess,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["china-restrictions"] });
  };

  const createMutation = useMutation({
    mutationFn: createChinaRestrictedItem,
    onSuccess: () => {
      toast.success("Item added to China restrictions");
      setAddOpen(false);
      setNewItemId("");
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChinaRestrictedItem,
    onSuccess: () => {
      toast.success("Restriction removed");
      setDeleteTargetId(null);
      invalidate();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tableColumnCount = writeEnabled ? 4 : 3;

  const handleAdd = () => {
    const trimmedId = newItemId.trim();
    if (!UUID_PATTERN.test(trimmedId)) {
      toast.error("Enter a valid item UUID");
      return;
    }
    createMutation.mutate({
      item_type: newItemType,
      item_id: trimmedId,
    });
  };

  if (userInfo && !canAccess) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="font-dynamic border h-[calc(100vh-40px)] overflow-auto bg-[#F5F5F5] dark:bg-[#181818] my-4 rounded-l-2xl">
      <div className="px-4 pt-10 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">China restrictions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Items listed here are hidden from users in Chinese timezones.
          </p>
        </div>
        {writeEnabled ? (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <IoMdAdd className="mr-1 h-4 w-4" />
            Add item
          </Button>
        ) : null}
      </div>

      <div className="px-4 pb-4">
        <select
          className="rounded border bg-background px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as RestrictedItemType | "ALL");
            setPage(0);
          }}
        >
          <option value="ALL">All types</option>
          {RESTRICTED_ITEM_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatItemType(type)}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="px-4 text-destructive text-sm">
          {getApiErrorMessage(error)}
        </p>
      ) : null}

      <div className="px-4 pb-8 overflow-x-auto">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Type</Pecha.TableHead>
              <Pecha.TableHead>Item ID</Pecha.TableHead>
              <Pecha.TableHead>Added</Pecha.TableHead>
              {writeEnabled ? <Pecha.TableHead>Actions</Pecha.TableHead> : null}
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>
            {isLoading ? (
              <Pecha.TableRow>
                <Pecha.TableCell colSpan={tableColumnCount}>
                  Loading…
                </Pecha.TableCell>
              </Pecha.TableRow>
            ) : items.length === 0 ? (
              <Pecha.TableRow>
                <Pecha.TableCell colSpan={tableColumnCount}>
                  No restricted items found.
                </Pecha.TableCell>
              </Pecha.TableRow>
            ) : (
              items.map((item) => (
                <Pecha.TableRow key={item.id}>
                  <Pecha.TableCell>{formatItemType(item.item_type)}</Pecha.TableCell>
                  <Pecha.TableCell className="font-mono text-sm">
                    {item.item_id}
                  </Pecha.TableCell>
                  <Pecha.TableCell>
                    {item.created_at
                      ? format(new Date(item.created_at), "MMM dd, yyyy HH:mm")
                      : "—"}
                  </Pecha.TableCell>
                  {writeEnabled ? (
                    <Pecha.TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deleteMutation.isPending}
                        onClick={() => setDeleteTargetId(item.id)}
                      >
                        Remove
                      </Button>
                    </Pecha.TableCell>
                  ) : null}
                </Pecha.TableRow>
              ))
            )}
          </Pecha.TableBody>
        </Pecha.Table>

        {totalPages > 1 ? (
          <div className="mt-4">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        ) : null}
      </div>

      <Pecha.Dialog open={addOpen} onOpenChange={setAddOpen}>
        <Pecha.DialogContent>
          <Pecha.DialogHeader>
            <Pecha.DialogTitle>Add China restriction</Pecha.DialogTitle>
            <DialogDescription>
              Choose the content type and paste the item UUID. It will be hidden
              for users in Chinese timezones.
            </DialogDescription>
          </Pecha.DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="w-full rounded border bg-background px-3 py-2 text-sm"
                value={newItemType}
                onChange={(e) =>
                  setNewItemType(e.target.value as RestrictedItemType)
                }
              >
                {RESTRICTED_ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatItemType(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Item ID</label>
              <Input
                placeholder="00000000-0000-0000-0000-000000000000"
                value={newItemId}
                onChange={(e) => setNewItemId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending || !newItemId.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </Pecha.DialogContent>
      </Pecha.Dialog>

      <Pecha.AlertDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Remove restriction?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This item will become visible again for users in Chinese
              timezones.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel>Cancel</Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              onClick={() => {
                if (deleteTargetId) {
                  deleteMutation.mutate(deleteTargetId);
                }
              }}
            >
              Remove
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default ChinaRestrictionsPage;
