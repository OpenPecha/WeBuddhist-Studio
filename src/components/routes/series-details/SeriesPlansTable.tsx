import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Pecha } from "@/components/ui/shadimport";
import { useNavigate } from "react-router-dom";
import defaultCover from "/default-image.webp";
import { PiDotsSixVertical } from "react-icons/pi";
import { formatDistanceToNow } from "date-fns";
import { ROUTES } from "@/routes/paths";
import { DASHBOARD_TABLE_ICON_BTN } from "@/components/routes/dashboard/dashboardTable";
import {
  FeaturedStar,
  languageChip,
  statusChip,
} from "@/components/routes/dashboard/dashboardTableUi";
import type { SeriesPlanRow } from "./seriesDetailsTypes";
import { SeriesPlanRowActions } from "./SeriesPlanRowActions";

function formatPlanModified(modifiedAt: string | null): string {
  if (!modifiedAt) return "—";
  const d = new Date(modifiedAt);
  if (Number.isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

function SortablePlanRow({
  plan,
  seriesId,
  onToggleFeatured,
  onRemoveFromSeries,
  canReorder,
}: {
  plan: SeriesPlanRow;
  seriesId: string;
  onToggleFeatured: (planId: string) => void;
  onRemoveFromSeries: (planId: string) => void;
  canReorder: boolean;
}) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysLabel = `${plan.total_days} ${plan.total_days === 1 ? "Day" : "Days"}`;
  const featuredDisabled = plan.status !== "PUBLISHED";

  return (
    <Pecha.TableRow
      ref={setNodeRef}
      style={style}
      className="dark:bg-background"
      {...attributes}
    >
      <Pecha.TableCell className="w-10">
        <button
          type="button"
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground touch-none disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Reorder ${plan.title}`}
          disabled={!canReorder}
          {...listeners}
        >
          <PiDotsSixVertical className="h-4 w-4" />
        </button>
      </Pecha.TableCell>
      <Pecha.TableCell>
        <button
          type="button"
          className="flex w-full items-center gap-3 text-left"
          onClick={() => navigate(ROUTES.plan(plan.id))}
        >
          <img
            src={plan.image_url || defaultCover}
            onError={(e) => {
              e.currentTarget.src = defaultCover;
            }}
            alt=""
            className="h-12 w-28 shrink-0 rounded border object-cover"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold">{plan.title}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {languageChip(plan.language)}
              {statusChip(plan.status)}
              <span className="rounded-full bg-[#DEAD2D4D] px-2.5 py-0.5 text-xs font-medium text-[#020C1D] dark:bg-[#DEAD2D4D] dark:text-white">
                {daysLabel}
              </span>
            </div>
          </div>
        </button>
      </Pecha.TableCell>
      <Pecha.TableCell className="text-center text-sm">
        {plan.enrolled}
      </Pecha.TableCell>
      <Pecha.TableCell className="text-center text-sm text-muted-foreground">
        {formatPlanModified(plan.modifiedAt)}
      </Pecha.TableCell>
      <Pecha.TableCell className="text-center">
        <Pecha.Button
          type="button"
          variant="outline"
          size="icon"
          className={`${DASHBOARD_TABLE_ICON_BTN} disabled:bg-[#F3F4F6] disabled:hover:bg-[#F3F4F6] dark:disabled:bg-[#2a2a2a] dark:disabled:hover:bg-[#2a2a2a]`}
          disabled={featuredDisabled}
          aria-label={plan.featured ? "Featured" : "Not featured"}
          onClick={() => onToggleFeatured(plan.id)}
        >
          <FeaturedStar featured={plan.featured} disabled={featuredDisabled} />
        </Pecha.Button>
      </Pecha.TableCell>
      <Pecha.TableCell className="text-center">
        <SeriesPlanRowActions
          planId={plan.id}
          status={plan.status}
          seriesId={seriesId}
          onRemoveFromSeries={() => onRemoveFromSeries(plan.id)}
        />
      </Pecha.TableCell>
    </Pecha.TableRow>
  );
}

type SeriesPlansTableProps = {
  plans: SeriesPlanRow[];
  seriesId: string;
  onReorder: (activeId: string, overId: string) => void;
  onToggleFeatured: (planId: string) => void;
  onRemoveFromSeries: (planId: string) => void;
};

export function SeriesPlansTable({
  plans,
  seriesId,
  onReorder,
  onToggleFeatured,
  onRemoveFromSeries,
}: SeriesPlansTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const canReorder = plans.length > 1;
  const ids = plans.map((p) => p.id);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <Pecha.Table className="bg-white dark:bg-[#181818]">
        <Pecha.TableHeader className="dark:bg-[#1d1d1f]">
          <Pecha.TableRow className="font-dynamic">
            <Pecha.TableHead className="w-10" />
            <Pecha.TableHead className="font-bold">Title</Pecha.TableHead>
            <Pecha.TableHead className="w-[100px] text-center font-bold">
              Enrolled
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[130px] text-center font-bold">
              Date Modified
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[72px] text-center font-bold">
              Featured
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[100px] text-center font-bold">
              Actions
            </Pecha.TableHead>
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <Pecha.TableBody>
            {plans.map((plan) => (
              <SortablePlanRow
                key={plan.id}
                plan={plan}
                seriesId={seriesId}
                onToggleFeatured={onToggleFeatured}
                onRemoveFromSeries={onRemoveFromSeries}
                canReorder={canReorder}
              />
            ))}
          </Pecha.TableBody>
        </SortableContext>
      </Pecha.Table>
    </DndContext>
  );
}
