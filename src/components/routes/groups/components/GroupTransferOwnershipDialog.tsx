import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { getApiErrorMessage } from "@/lib/apiErrors";
import {
  transferGroupOwnership,
  type AuthorGroupMemberDTO,
} from "../api/groupsApi";

type GroupTransferOwnershipDialogProps = {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: AuthorGroupMemberDTO[];
  onSuccess: () => void;
};

const GroupTransferOwnershipDialog = ({
  groupId,
  open,
  onOpenChange,
  candidates,
  onSuccess,
}: GroupTransferOwnershipDialogProps) => {
  const [selectedAuthorId, setSelectedAuthorId] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedAuthorId("");
      return;
    }
    setSelectedAuthorId(candidates[0]?.author_id ?? "");
  }, [open, candidates]);

  const transferMutation = useMutation({
    mutationFn: () =>
      transferGroupOwnership(groupId, {
        new_owner_author_id: selectedAuthorId,
      }),
    onSuccess: () => {
      toast.success("Ownership transferred");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const selectedMember = candidates.find(
    (m) => m.author_id === selectedAuthorId,
  );

  return (
    <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
      <Pecha.DialogContent>
        <Pecha.DialogHeader>
          <Pecha.DialogTitle>Transfer ownership</Pecha.DialogTitle>
        </Pecha.DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a member to become the group owner. You will become an admin
            and can still edit group settings.
          </p>

          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add another member before transferring ownership.
            </p>
          ) : (
            <Pecha.Select
              value={selectedAuthorId}
              onValueChange={setSelectedAuthorId}
            >
              <Pecha.SelectTrigger className="w-full">
                <Pecha.SelectValue placeholder="Select member" />
              </Pecha.SelectTrigger>
              <Pecha.SelectContent>
                {candidates.map((member) => (
                  <Pecha.SelectItem
                    key={member.author_id}
                    value={member.author_id}
                  >
                    {member.firstname} {member.lastname} ({member.email})
                  </Pecha.SelectItem>
                ))}
              </Pecha.SelectContent>
            </Pecha.Select>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={transferMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#A51C21] text-white hover:bg-[#A51C21]/90"
              disabled={
                !selectedAuthorId ||
                candidates.length === 0 ||
                transferMutation.isPending
              }
              onClick={() => transferMutation.mutate()}
            >
              {transferMutation.isPending
                ? "Transferring…"
                : selectedMember
                  ? `Transfer to ${selectedMember.firstname}`
                  : "Transfer"}
            </Button>
          </div>
        </div>
      </Pecha.DialogContent>
    </Pecha.Dialog>
  );
};

export default GroupTransferOwnershipDialog;
