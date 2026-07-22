import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdArrowBack, IoMdCreate, IoMdTrash, IoMdAdd, IoMdClose } from "react-icons/io";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { ROUTES } from "@/routes/paths";
import type { GroupOutletContext } from "./GroupLayout";
import { canWriteEvents } from "./lib/eventPermissions";
import {
  addChantItems,
  deleteChantItem,
  fetchChantCollection,
  searchRecitations,
  type ChantCollectionItemDTO,
} from "./api/chantsApi";
import FkMultiSearchSelector from "./components/FkMultiSearchSelector";
import type { FkOption } from "./components/FkMultiSearchSelector";

const GroupChantDetailPage = () => {
  const { groupId, collectionId } = useParams<{
    groupId: string;
    collectionId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { myRole, userInfo, readOnlyPlatform } =
    useOutletContext<GroupOutletContext>();

  const canWrite =
    !readOnlyPlatform && canWriteEvents(myRole, userInfo?.platform_role);

  const [pendingDeleteItem, setPendingDeleteItem] =
    useState<ChantCollectionItemDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecitations, setSelectedRecitations] = useState<FkOption[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cms-chant-collection", groupId, collectionId],
    queryFn: () => fetchChantCollection(groupId!, collectionId!),
    enabled: Boolean(groupId) && Boolean(collectionId),
    refetchOnWindowFocus: false,
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      deleteChantItem(groupId!, collectionId!, itemId),
    onSuccess: () => {
      toast.success("Item removed");
      setPendingDeleteItem(null);
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collection", groupId, collectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collections", groupId],
      });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const addItemsMutation = useMutation({
    mutationFn: (textIds: string[]) =>
      addChantItems(groupId!, collectionId!, textIds),
    onSuccess: () => {
      toast.success("Items added successfully");
      setSelectedRecitations([]);
      setIsEditMode(false);
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collection", groupId, collectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-chant-collections", groupId],
      });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleAddItems = () => {
    if (selectedRecitations.length === 0) {
      toast.error("Please select at least one recitation");
      return;
    }
    addItemsMutation.mutate(selectedRecitations.map((r) => r.id));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedRecitations([]);
  };

  const chantsListPath = groupId ? ROUTES.groupChants(groupId) : ROUTES.groups;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading collection…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-center text-destructive">
          {getApiErrorMessage(error, "Could not load this collection.")}
        </p>
        <Pecha.Button variant="outline" onClick={() => navigate(chantsListPath)}>
          Back to chants
        </Pecha.Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={chantsListPath}>
              <IoMdArrowBack className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">{data.name}</h1>
        </div>
        {canWrite && !isEditMode ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
          >
            <IoMdAdd className="w-4 h-4" /> Add Chants
          </Button>
        ) : canWrite && isEditMode ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelEdit}
          >
            <IoMdClose className="w-4 h-4" /> Cancel
          </Button>
        ) : null}
      </div>

      {data.img_url ? (
        <img
          src={data.img_url}
          alt=""
          className="w-full max-h-48 object-cover rounded-lg border"
        />
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Items ({data.items.length})
        </h2>

        {isEditMode && (
          <div className="rounded-lg border border-blue-900 bg-blue-900/5 p-4 space-y-4">
            <h3 className="text-sm font-bold">Add Recitations</h3>
            <FkMultiSearchSelector
              value={selectedRecitations}
              onChange={setSelectedRecitations}
              searchFn={searchRecitations}
              queryKeyPrefix="recitation-search"
              searchPlaceholder="Search recitations..."
              emptyMessage="No recitations selected — use search to add."
              hideLabel
            />
            <div className="flex justify-end gap-2">
              <Pecha.Button
                type="button"
                onClick={handleAddItems}
                disabled={addItemsMutation.isPending || selectedRecitations.length === 0}
                className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
              >
                {addItemsMutation.isPending ? "Adding..." : `Add ${selectedRecitations.length} Chant${selectedRecitations.length === 1 ? "" : "s"}`}
              </Pecha.Button>
            </div>
          </div>
        )}

        {data.items.length === 0 ? (
          <p className="text-muted-foreground">No items in this collection.</p>
        ) : (
          <div className="rounded-lg border">
            <Pecha.Table>
              <Pecha.TableHeader>
                <Pecha.TableRow>
                  <Pecha.TableHead className="w-12">#</Pecha.TableHead>
                  <Pecha.TableHead>Title</Pecha.TableHead>
                  <Pecha.TableHead>Language</Pecha.TableHead>
                  <Pecha.TableHead>Type</Pecha.TableHead>
                  {canWrite ? (
                    <Pecha.TableHead className="text-right">
                      Actions
                    </Pecha.TableHead>
                  ) : null}
                </Pecha.TableRow>
              </Pecha.TableHeader>
              <Pecha.TableBody>
                {data.items.map((item, index) => (
                  <Pecha.TableRow key={item.id}>
                    <Pecha.TableCell className="text-muted-foreground">
                      {index + 1}
                    </Pecha.TableCell>
                    <Pecha.TableCell className="font-medium">
                      {item.title}
                    </Pecha.TableCell>
                    <Pecha.TableCell>
                      {item.language ?? "—"}
                    </Pecha.TableCell>
                    <Pecha.TableCell>
                      {item.type ?? "—"}
                    </Pecha.TableCell>
                    {canWrite ? (
                      <Pecha.TableCell className="text-right">
                        <Pecha.Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setPendingDeleteItem(item)}
                          aria-label={`Remove ${item.title}`}
                        >
                          <IoMdTrash className="h-4 w-4" />
                        </Pecha.Button>
                      </Pecha.TableCell>
                    ) : null}
                  </Pecha.TableRow>
                ))}
              </Pecha.TableBody>
            </Pecha.Table>
          </div>
        )}
      </div>

      <Pecha.AlertDialog
        open={Boolean(pendingDeleteItem)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteItem(null);
        }}
      >
        <Pecha.AlertDialogContent>
          <Pecha.AlertDialogHeader>
            <Pecha.AlertDialogTitle>Remove item?</Pecha.AlertDialogTitle>
            <Pecha.AlertDialogDescription>
              This will remove &ldquo;{pendingDeleteItem?.title ?? ""}&rdquo;
              from this collection.
            </Pecha.AlertDialogDescription>
          </Pecha.AlertDialogHeader>
          <Pecha.AlertDialogFooter>
            <Pecha.AlertDialogCancel disabled={deleteItemMutation.isPending}>
              Cancel
            </Pecha.AlertDialogCancel>
            <Pecha.AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteItemMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDeleteItem)
                  deleteItemMutation.mutate(pendingDeleteItem.id);
              }}
            >
              {deleteItemMutation.isPending ? "Removing…" : "Remove"}
            </Pecha.AlertDialogAction>
          </Pecha.AlertDialogFooter>
        </Pecha.AlertDialogContent>
      </Pecha.AlertDialog>
    </div>
  );
};

export default GroupChantDetailPage;
