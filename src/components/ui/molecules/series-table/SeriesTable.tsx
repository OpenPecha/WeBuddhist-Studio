import { Pecha } from "@/components/ui/shadimport";
import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import PlanDeleteDialog from "@/components/ui/molecules/modals/plan-delete/PlanDeleteDialog";

export interface SeriesPlanSummary {
  id: string;
  title: string;
}

export interface SeriesRow {
  id: string;
  title: string;
  total_days: number;
  enrolled: number;
  status: "PUBLISHED" | "UNPUBLISHED" | "DRAFT" | "ARCHIVED";
  language: string;
  featured: boolean;
  plans: SeriesPlanSummary[];
}

interface SeriesTableProps {
  series: SeriesRow[];
  isLoading?: boolean;
  error?: any;
  onDeleteSeries: (seriesId: string) => void;
}

function StatusDot({ status }: { status: SeriesRow["status"] }) {
  const color =
    status === "PUBLISHED"
      ? "bg-green-500"
      : status === "UNPUBLISHED"
        ? "bg-red-500"
        : status === "ARCHIVED"
          ? "bg-gray-500"
          : "bg-sky-500";

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

export function SeriesTable({
  series,
  isLoading,
  error,
  onDeleteSeries,
}: SeriesTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderBody = () => {
    if (isLoading) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell colSpan={7} className="text-center py-6">
            Loading...
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    if (error) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={7}
            className="text-center py-6 text-red-500"
          >
            {error.message}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    if (series.length === 0) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={7}
            className="text-center py-6 text-muted-foreground"
          >
            No series found.
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    return series.flatMap((s) => {
      const isOpen = !!expanded[s.id];
      const Chevron = isOpen ? FaChevronDown : FaChevronRight;

      return [
        <Pecha.TableRow key={s.id} className="dark:bg-background">
          <Pecha.TableCell className="w-[44px]">
            <Pecha.Button
              variant="ghost"
              size="icon"
              onClick={() => toggleRow(s.id)}
              aria-label={isOpen ? "Collapse row" : "Expand row"}
            >
              <Chevron size={14} />
            </Pecha.Button>
          </Pecha.TableCell>
          <Pecha.TableCell className="font-semibold text-sm">
            {s.title}
          </Pecha.TableCell>
          <Pecha.TableCell>{s.total_days} Days</Pecha.TableCell>
          <Pecha.TableCell>{s.enrolled}</Pecha.TableCell>
          <Pecha.TableCell>
            <StatusDot status={s.status} />
          </Pecha.TableCell>
          <Pecha.TableCell>{s.language || "-"}</Pecha.TableCell>
          <Pecha.TableCell>{s.featured ? "Yes" : "No"}</Pecha.TableCell>
          <Pecha.TableCell className="w-[120px]">
            <Pecha.DropdownMenu>
              <Pecha.DropdownMenuTrigger asChild>
                <Pecha.Button
                  variant="outline"
                  size="icon"
                  aria-label="Actions"
                >
                  <BsThreeDotsVertical />
                </Pecha.Button>
              </Pecha.DropdownMenuTrigger>
              <Pecha.DropdownMenuContent
                align="end"
                className="[--radius:1rem]"
              >
                <PlanDeleteDialog
                  planId={s.id}
                  entityLabel="Series"
                  onDelete={onDeleteSeries}
                  trigger={
                    <Pecha.DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex items-center gap-2 w-full">
                        <IoMdTrash className="h-4 w-4" />
                        Delete Series
                      </span>
                    </Pecha.DropdownMenuItem>
                  }
                />
              </Pecha.DropdownMenuContent>
            </Pecha.DropdownMenu>
          </Pecha.TableCell>
        </Pecha.TableRow>,
        isOpen ? (
          <Pecha.TableRow
            key={`${s.id}__expanded`}
            className="dark:bg-background"
          >
            <Pecha.TableCell />
            <Pecha.TableCell colSpan={7} className="py-3">
              <div className="text-sm">
                <div className="font-semibold mb-2">Plans in this series</div>
                {s.plans.length === 0 ? (
                  <div className="text-muted-foreground">
                    No plans added yet to this series.
                  </div>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {s.plans.map((p) => (
                      <li key={p.id}>{p.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Pecha.TableCell>
          </Pecha.TableRow>
        ) : null,
      ].filter(Boolean) as any;
    });
  };

  return (
    <Pecha.Table className="bg-white dark:bg-[#181818]">
      <Pecha.TableHeader className="dark:bg-[#1d1d1f]">
        <Pecha.TableRow className="font-dynamic">
          <Pecha.TableHead className="w-[44px]" />
          <Pecha.TableHead className="font-bold">Title</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">No. of days</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">Enrolled</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">Status</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">Language</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">Featured</Pecha.TableHead>
          <Pecha.TableHead className="font-bold">Actions</Pecha.TableHead>
        </Pecha.TableRow>
      </Pecha.TableHeader>
      <Pecha.TableBody>{renderBody()}</Pecha.TableBody>
    </Pecha.Table>
  );
}
