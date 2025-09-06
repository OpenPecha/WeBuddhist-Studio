import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../atoms/table";
import { Button } from "../../atoms/button";
import { Badge } from "../../atoms/badge";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
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
        <Badge className="bg-green-100 rounded-2xl dark:bg-green-900 text-green-500 px-3 py-1.5 text-sm font-bold">
          Published
        </Badge>
      );
    } else {
      return (
        <Badge className="px-3 py-1.5 text-sm font-bold rounded-2xl dark:bg-blue-900 bg-[#E1F0FF] text-[#008DFF] dark:text-cyan-500">
          In Draft
        </Badge>
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
        <TableRow>
          <TableCell
            colSpan={6}
            className="text-center py-10 text-muted-foreground"
          >
            Loading...
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10 text-red-500">
            {error.message}
          </TableCell>
        </TableRow>
      );
    }

    if (plans.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            className="text-center py-10 text-muted-foreground"
          >
            <div className="flex flex-col items-center justify-center">
              <p className="text-base text-muted-foreground">
                {t("studio.dashboard.no_plan_found")}
              </p>
              <Button
                onClick={() => navigate("/create-plan")}
                variant="outline"
                className="mt-2"
              >
                <IoMdAdd /> {t("studio.dashboard.add_plan")}
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return plans.map((plan) => (
      <TableRow key={plan.id} className="hover:cursor-pointer">
        <TableCell>
          <img
            src={plan.image_url}
            alt="cover"
            className="w-32 h-20 object-cover rounded-md"
          />
        </TableCell>
        <TableCell>
          <div className="font-semibold text-base">{plan.title}</div>
          <div className="text-xs text-muted-foreground max-w-2xl truncate">
            {plan.description}
          </div>
        </TableCell>
        <TableCell>{plan.total_days} Days</TableCell>
        <TableCell>{plan.subscription_count} Used</TableCell>
        <TableCell>{getStatusBadge(plan.status)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" className="h-8 w-10">
              <IoMdTrash className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-10 text-gray-500 bg-gray-100 hover:bg-gray-200"
            >
              <FaPen className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <div className="w-full h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="font-dynamic">
            <TableHead className="w-[160px] font-bold">
              {t("studio.dashboard.cover_image")}
            </TableHead>
            <TableHead
              className="font-bold cursor-pointer"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.title")}
                {getSortIcon("title")}
              </div>
            </TableHead>
            <TableHead
              className="w-[150px] font-bold cursor-pointer"
              onClick={() => onSort("total_days")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.plan_days")}
                {getSortIcon("total_days")}
              </div>
            </TableHead>
            <TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.plan_used")}
            </TableHead>
            <TableHead className="w-[150px] font-bold">Status</TableHead>
            <TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
    </div>
  );
}
