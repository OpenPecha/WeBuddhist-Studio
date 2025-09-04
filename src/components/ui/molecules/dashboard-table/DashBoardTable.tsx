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
import { Pencil, Plus, Trash, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
export interface Plan {
  id: string;
  coverImage: string;
  title: string;
  subtitle: string;
  planDay: string;
  planUsed: string;
  status: string;
}

interface DashBoardTableProps {
  plans: Plan[];
  t: (key: string, parameters?: any) => string;
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
}

export function DashBoardTable({
  plans,
  t,
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
    if (sortBy === column) {
      return sortOrder === "asc" ? (
        <ChevronUp
          size={18}
          className="ml-2 text-gray-600 dark:text-gray-400"
        />
      ) : (
        <ChevronDown
          size={18}
          className="ml-2 text-gray-600 dark:text-gray-400"
        />
      );
    }
    return (
      <ChevronDown
        size={18}
        className="ml-2 text-gray-300 dark:text-gray-400 opacity-50"
      />
    );
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
              className="font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.title")}
                {getSortIcon("title")}
              </div>
            </TableHead>
            <TableHead
              className="w-[150px] font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort("total_days")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.plan_days")}
                {getSortIcon("total_days")}
              </div>
            </TableHead>
            <TableHead
              className="w-[150px] font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort("subscription_count")}
            >
              <div className="flex items-center">
                {t("studio.dashboard.plan_used")}
                {getSortIcon("subscription_count")}
              </div>
            </TableHead>
            <TableHead className="w-[150px] font-bold">Status</TableHead>
            <TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
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
                    onClick={() => {
                      navigate("/create-plan");
                    }}
                    variant="outline"
                    className=" mt-2"
                  >
                    {" "}
                    <Plus /> {t("studio.dashboard.add_plan")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id} className=" hover:cursor-pointer">
                <TableCell>
                  <img
                    src={plan.coverImage}
                    alt="cover"
                    className="w-32 h-20 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-base">{plan.title}</div>
                  <div className="text-xs text-muted-foreground max-w-2xl truncate">
                    {plan.subtitle}
                  </div>
                </TableCell>
                <TableCell>{plan.planDay}</TableCell>
                <TableCell>{plan.planUsed}</TableCell>
                <TableCell>{getStatusBadge(plan.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-10 text-gray-500 bg-gray-100 hover:bg-gray-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
