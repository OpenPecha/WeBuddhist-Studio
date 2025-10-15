import { Pecha } from "@/components/ui/shadimport";
import { IoMdAdd } from "react-icons/io";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import defaultCover from "/default-image.webp";
import { DropdownButton } from "../dropdown-button/DropdownButton";

export interface Plan {
  id: string;
  image_url: string;
  title: string;
  description: string;
  total_days: string;
  subscription_count: string;
  status: string;
}

interface DashBoardTableProps {
  plans: Plan[];
  t: (key: string, parameters?: any) => string;
  isLoading?: boolean;
  error?: any;
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
}

export function DashBoardTable({
  plans,
  t,
  isLoading,
  error,
  sortBy,
  sortOrder,
  onSort,
}: DashBoardTableProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    if (status === "Published") {
      return (
        <Pecha.Badge className="bg-green-100  dark:bg-green-900 text-green-500 px-3 py-1.5 text-sm font-bold">
          Published
        </Pecha.Badge>
      );
    } else {
      return (
        <Pecha.Badge className="px-3 py-1.5 rounded text-sm font-bold dark:bg-blue-900 bg-[#E1F0FF] text-[#008DFF] dark:text-cyan-500">
          In Draft
        </Pecha.Badge>
      );
    }
  };

  const getSortIcon = (column: string) => {
    const isActive = sortBy === column;
    const Icon = isActive && sortOrder === "asc" ? FaChevronUp : FaChevronDown;
    const colorClass = isActive
      ? "text-gray-600 dark:text-gray-400"
      : "text-gray-300 dark:text-gray-400 opacity-50";

    return <Icon size={12} className={`ml-2 ${colorClass}`} />;
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={6}
            className="text-center py-6 text-muted-foreground"
          >
            Loading...
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    if (error) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={6}
            className="text-center py-6 text-red-500"
          >
            {error.message}
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    if (plans.length === 0) {
      return (
        <Pecha.TableRow>
          <Pecha.TableCell
            colSpan={6}
            className="text-center py-10 text-muted-foreground"
          >
            <div className="flex flex-col items-center justify-center">
              <p className="text-base text-muted-foreground">
                {t("studio.dashboard.no_plan_found")}
              </p>
              <Pecha.Button
                onClick={() => navigate("/plan/new")}
                variant="outline"
                className="mt-2"
              >
                <IoMdAdd /> {t("studio.dashboard.add_plan")}
              </Pecha.Button>
            </div>
          </Pecha.TableCell>
        </Pecha.TableRow>
      );
    }

    return plans.map((plan) => (
      <Pecha.TableRow key={plan.id}>
        <Pecha.TableCell>
          <img
            src={plan.image_url || defaultCover}
            onError={(e) => {
              e.currentTarget.src = defaultCover;
            }}
            alt="cover"
            className="w-32 rounded border-2 h-12 object-cover"
          />
        </Pecha.TableCell>
        <Pecha.TableCell
          className="cursor-pointer"
          onClick={() => navigate(`/plan/${plan.id}/plan-details`)}
        >
          <div className="font-semibold text-base">{plan.title}</div>
          <div className="text-xs text-muted-foreground max-w-2xl truncate">
            {plan.description}
          </div>
        </Pecha.TableCell>
        <Pecha.TableCell>{plan.total_days} Days</Pecha.TableCell>
        <Pecha.TableCell>{plan.subscription_count} Used</Pecha.TableCell>
        <Pecha.TableCell>{getStatusBadge(plan.status)}</Pecha.TableCell>
        <Pecha.TableCell>
          <div className="flex items-center gap-2">
            <DropdownButton planId={plan.id} />
          </div>
        </Pecha.TableCell>
      </Pecha.TableRow>
    ));
  };
  return (
    <div className="w-full h-[640px] overflow-auto">
      <Pecha.Table>
        <Pecha.TableHeader>
          <Pecha.TableRow className="font-dynamic">
            <Pecha.TableHead className="w-[160px] font-bold">
              {t("studio.dashboard.cover_image")}
            </Pecha.TableHead>
            <Pecha.TableHead
              className="font-bold cursor-pointer"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.title")}
                {getSortIcon("title")}
              </div>
            </Pecha.TableHead>
            <Pecha.TableHead
              className="w-[150px] font-bold cursor-pointer"
              onClick={() => onSort("total_days")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.plan_days")}
                {getSortIcon("total_days")}
              </div>
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.plan_used")}
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[150px] font-bold">
              Status
            </Pecha.TableHead>
            <Pecha.TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.actions")}
            </Pecha.TableHead>
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <Pecha.TableBody>{renderTableContent()}</Pecha.TableBody>
      </Pecha.Table>
    </div>
  );
}
