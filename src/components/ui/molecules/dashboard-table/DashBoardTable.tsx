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
import { Pencil, Plus, Trash } from "lucide-react";
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
}

export function DashBoardTable({ plans, t }: DashBoardTableProps) {
  const navigate = useNavigate();
  const getStatusBadge = (status: string) => {
    if (status === "Published") {
      return (
        <Badge className="bg-green-100 text-green-500 px-3 py-1.5 text-base font-medium">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-green-500 mr-2"></div>
          Published
        </Badge>
      );
    } else {
      return (
        <Badge className="px-3 py-1.5 text-base font-medium" style={{color: '#008DFF', backgroundColor: '#E1F0FF'}}>
          <div className="w-3 h-3 rounded-full border-2 border-dashed mr-2" style={{borderColor: '#008DFF'}}></div>
          In Draft
        </Badge>
      );
    }
  };
  return (
    <div className="w-full h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="font-dynamic">
            <TableHead className="w-[160px] font-bold">
              {t("studio.dashboard.cover_image")}
            </TableHead>
            <TableHead className="font-bold">
              {t("studio.dashboard.title")}
            </TableHead>
            <TableHead className="w-[150px] font-bold">
              {t("studio.dashboard.plan_days")}
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
