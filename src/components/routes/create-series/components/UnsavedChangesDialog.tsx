import { useTranslate } from "@tolgee/react";
import { Pecha } from "@/components/ui/shadimport";

type UnsavedChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) => {
  const { t } = useTranslate();

  return (
    <Pecha.Dialog open={open} onOpenChange={onOpenChange}>
      <Pecha.DialogContent showCloseButton={false}>
        <Pecha.DialogHeader>
          <Pecha.DialogTitle>
            {t("studio.plan.navigation.confirm_title")}
          </Pecha.DialogTitle>
        </Pecha.DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t("studio.plan.navigation.confirm_message")}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Pecha.Button variant="outline" onClick={onCancel}>
            {t("common.button.cancel")}
          </Pecha.Button>
          <Pecha.Button variant="destructive" onClick={onConfirm}>
            {t("studio.plan.navigation.leave")}
          </Pecha.Button>
        </div>
      </Pecha.DialogContent>
    </Pecha.Dialog>
  );
};

export default UnsavedChangesDialog;
