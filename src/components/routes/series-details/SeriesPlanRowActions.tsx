import { DropdownButton } from "@/components/ui/molecules/dropdown-button/DropdownButton";
import { DASHBOARD_TABLE_ICON_BTN } from "@/components/routes/dashboard/dashboardTable";

type SeriesPlanRowActionsProps = {
  planId: string;
  status: string;
  seriesId: string;
  onRemoveFromSeries: () => void;
};

export function SeriesPlanRowActions({
  planId,
  status,
  seriesId,
  onRemoveFromSeries,
}: SeriesPlanRowActionsProps) {
  return (
    <DropdownButton
      id={planId}
      entityType="plan"
      currentStatus={status}
      triggerVariant="icon"
      triggerClassName={DASHBOARD_TABLE_ICON_BTN}
      invalidateSeriesId={seriesId}
      additionalMenuItems={[
        { label: "Remove from series", onClick: onRemoveFromSeries },
      ]}
    />
  );
}
