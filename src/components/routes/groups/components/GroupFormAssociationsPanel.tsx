import PlanTagSearchInput from "@/components/routes/create-plan/PlanTagSearchInput";
import type { TagSummaryDTO } from "../api/groupsApi";
import {
  mapGroupTagsToPlanTagSummaries,
  searchPlansForPicker,
  searchSeriesForPicker,
} from "../api/groupPickerApi";
import FkMultiSearchSelector, { type FkOption } from "./FkMultiSearchSelector";
import { GroupEditableSection } from "./GroupSection";
import GroupSocialLinksEditor from "./GroupSocialLinksEditor";
import type { GroupSocialLinkDTO } from "../api/groupsApi";

type GroupFormAssociationsPanelProps = {
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  initialTags: TagSummaryDTO[];
  selectedPlans: FkOption[];
  onPlansChange: (plans: FkOption[]) => void;
  selectedSeries: FkOption[];
  onSeriesChange: (series: FkOption[]) => void;
  socialLinks: GroupSocialLinkDTO[];
  onSocialLinksChange: (links: GroupSocialLinkDTO[]) => void;
  onSaveTags: () => void;
  onSavePlans: () => void;
  onSaveSeries: () => void;
  onSaveSocial: () => void;
  tagsSaving: boolean;
  plansSaving: boolean;
  seriesSaving: boolean;
  socialSaving: boolean;
};

const GroupFormAssociationsPanel = ({
  tagIds,
  onTagIdsChange,
  initialTags,
  selectedPlans,
  onPlansChange,
  selectedSeries,
  onSeriesChange,
  socialLinks,
  onSocialLinksChange,
  onSaveTags,
  onSavePlans,
  onSaveSeries,
  onSaveSocial,
  tagsSaving,
  plansSaving,
  seriesSaving,
  socialSaving,
}: GroupFormAssociationsPanelProps) => (
  <div className="w-full xl:w-1/2 xl:min-w-0 p-4 sm:p-8 pb-12 space-y-10">
    <GroupEditableSection
      title="Tags"
      onSave={onSaveTags}
      isSaving={tagsSaving}
      saveLabel="Save tags"
      savingLabel="Saving…"
    >
      <PlanTagSearchInput
        value={tagIds}
        onChange={onTagIdsChange}
        hideLabel
        initialTags={mapGroupTagsToPlanTagSummaries(initialTags)}
      />
    </GroupEditableSection>

    <GroupEditableSection
      title="Linked plans"
      onSave={onSavePlans}
      isSaving={plansSaving}
      saveLabel="Save plans"
      savingLabel="Saving…"
    >
      <FkMultiSearchSelector
        value={selectedPlans}
        onChange={onPlansChange}
        searchFn={searchPlansForPicker}
        queryKeyPrefix="group-plan-search"
        hideLabel
        searchPlaceholder="Search plans to link…"
        emptyMessage="No plans linked — search to add plans."
      />
    </GroupEditableSection>

    <GroupEditableSection
      title="Linked series"
      onSave={onSaveSeries}
      isSaving={seriesSaving}
      saveLabel="Save series"
      savingLabel="Saving…"
    >
      <FkMultiSearchSelector
        value={selectedSeries}
        onChange={onSeriesChange}
        searchFn={searchSeriesForPicker}
        queryKeyPrefix="group-series-search"
        hideLabel
        searchPlaceholder="Search series to link…"
        emptyMessage="No series linked — search to add series."
      />
    </GroupEditableSection>

    <GroupEditableSection
      title="Social links"
      onSave={onSaveSocial}
      isSaving={socialSaving}
      saveLabel="Save links"
      savingLabel="Saving…"
    >
      <GroupSocialLinksEditor
        value={socialLinks}
        onChange={onSocialLinksChange}
        hideLabel
      />
    </GroupEditableSection>
  </div>
);

export default GroupFormAssociationsPanel;
