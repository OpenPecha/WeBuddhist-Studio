import { Pecha } from "@/components/ui/shadimport";
import { useNavigate } from "react-router-dom";
import defaultCover from "/default-image.webp";
import { FaStar } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuLayers } from "react-icons/lu";
import { DropdownButton } from "@/components/ui/molecules/dropdown-button/DropdownButton";
import type {
  DashboardLanguageCode,
  DashboardTableRow,
} from "./dashboardTable";
import { formatRowModified, isMockDashboardId } from "./dashboardTable";

function statusChip(status: string) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-[#4BBE51] dark:bg-green-900/40 dark:text-green-200">
          Published
        </span>
      );
    case "UNPUBLISHED":
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">
          Unpublished
        </span>
      );
    case "ARCHIVED":
      return (
        <span className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:border-gray-600 dark:bg-transparent dark:text-gray-100">
          Archived
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[#E0EDFE] px-2.5 py-0.5 text-xs font-medium text-[#020C1D] dark:bg-blue-950/50 dark:text-white">
          Draft
        </span>
      );
  }
}

function languageChip(code: DashboardLanguageCode) {
  switch (code) {
    case "BO":
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          བོད་སྐད།
        </span>
      );
    case "ZH":
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          中国人
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5 text-xs font-medium text-gray-900 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700">
          English
        </span>
      );
  }
}

interface DashboardContentTableProps {
  rows: DashboardTableRow[];
  isLoading?: boolean;
  t: (key: string, parameters?: any) => string;
  handleFeatured: (planId: string) => void;
}

export function DashboardContentTable({
  rows,
  // isLoading,
  t,
  handleFeatured,
}: DashboardContentTableProps) {
  const navigate = useNavigate();

  const renderBody = () => {
    return rows.map((row) => {
      const daysLabel = `${row.total_days} ${row.total_days === 1 ? "Day" : "Days"}`;
      const titleHref =
        row.kind === "plan"
          ? `/plan/${row.id}/plan-details`
          : `/series/${row.id}`;
      const modifiedDisplay = formatRowModified(row);

      return (
        <Pecha.TableRow
          key={`${row.kind}-${row.id}`}
          className="dark:bg-background"
        >
          <Pecha.TableCell>
            <div className="relative inline-block">
              <img
                src={row.image_url || defaultCover}
                onError={(e) => {
                  e.currentTarget.src = defaultCover;
                }}
                alt=""
                className="h-12 w-28 rounded border object-cover"
              />
              {row.kind === "series" ? (
                <span
                  className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm"
                  aria-label={`Series, ${row.plans_count ?? 0} plans`}
                >
                  <LuLayers className="h-3 w-3 shrink-0" aria-hidden />
                  {row.plans_count ?? 0}
                </span>
              ) : null}
            </div>
          </Pecha.TableCell>
          <Pecha.TableCell>
            <button
              type="button"
              className="text-left"
              onClick={() => navigate(titleHref)}
            >
              <div className="text-sm font-semibold">{row.title}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {row.languages?.map((code: DashboardLanguageCode) => (
                  <span key={`${row.id}-${code}`}>{languageChip(code)}</span>
                ))}
                {statusChip(row.status)}
                <span className="rounded-full bg-[#DEAD2D4D] px-2.5 py-0.5 text-xs font-medium text-[#020C1D] dark:bg-[#DEAD2D4D] dark:text-white">
                  {daysLabel}
                </span>
              </div>
            </button>
          </Pecha.TableCell>
          <Pecha.TableCell className="text-sm">{row.enrolled}</Pecha.TableCell>
          <Pecha.TableCell className="text-sm text-muted-foreground">
            {modifiedDisplay}
          </Pecha.TableCell>
          <Pecha.TableCell>
            {row.kind === "plan" && !isMockDashboardId(row.id) ? (
              <Pecha.Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={row.status !== "PUBLISHED"}
                aria-label={row.featured ? "Featured" : "Not featured"}
                onClick={() => handleFeatured(row.id)}
              >
                <FaStar
                  className={
                    row.featured
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              </Pecha.Button>
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center">
                <FaStar
                  className={
                    row.featured
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              </span>
            )}
          </Pecha.TableCell>
          <Pecha.TableCell className="w-[100px]">
            {row.kind === "plan" && isMockDashboardId(row.id) ? (
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
                  <Pecha.DropdownMenuItem disabled>
                    Preview (mock)
                  </Pecha.DropdownMenuItem>
                </Pecha.DropdownMenuContent>
              </Pecha.DropdownMenu>
            ) : (
              <DropdownButton
                planId={row.id}
                entityType={row.kind}
                currentStatus={row.status}
                triggerVariant="icon"
              />
            )}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    });
  };

  return (
    <Pecha.Table className="bg-white dark:bg-[#181818]">
      <Pecha.TableHeader className="dark:bg-[#1d1d1f]">
        <Pecha.TableRow className="font-dynamic">
          <Pecha.TableHead className="w-[120px] font-bold">
            {t("studio.dashboard.cover_image")}
          </Pecha.TableHead>
          <Pecha.TableHead className="font-bold">
            {t("studio.dashboard.title")}
          </Pecha.TableHead>
          <Pecha.TableHead className="w-[100px] font-bold">
            Enrolled
          </Pecha.TableHead>
          <Pecha.TableHead className="w-[130px] font-bold">
            Date Modified
          </Pecha.TableHead>
          <Pecha.TableHead className="w-[72px] font-bold">
            Featured
          </Pecha.TableHead>
          <Pecha.TableHead className="w-[100px] font-bold">
            {t("studio.dashboard.actions")}
          </Pecha.TableHead>
        </Pecha.TableRow>
      </Pecha.TableHeader>
      <Pecha.TableBody>{renderBody()}</Pecha.TableBody>
    </Pecha.Table>
  );
}
