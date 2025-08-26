import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../atoms/table"
import { Button } from "../../atoms/button"
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
export interface Plan {
  id: string;
  coverImage: string;
  title: string;
  subtitle: string;
  planDay: string;
  planUsed: string;
}

interface DashBoardTableProps {
  plans: Plan[];
  t: (key: string, parameters?: any) => string;
}

export function DashBoardTable({ plans,t }: DashBoardTableProps) {
  const navigate = useNavigate()
  return (
    <div className="w-full h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="font-dynamic">
            <TableHead className="w-[160px] font-bold">{t("studio.dashboard.cover_image")}</TableHead>
            <TableHead className="font-bold">{t("studio.dashboard.title")}</TableHead>
            <TableHead className="w-[100px] font-bold">Plan Days</TableHead>
            <TableHead className="w-[150px] font-bold">Plan Used</TableHead>
            <TableHead className="w-[150px] font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                <p className="text-base text-muted-foreground">No Plan Found</p>
                <Button  onClick={()=>{navigate("/create-plan")}} variant="outline" className=" mt-2"> <Plus/> Add Plan</Button>
                </div>
               
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id} className=" hover:cursor-pointer">
                <TableCell>
                  <img src={plan.coverImage} alt="cover" className="w-32 h-20 object-cover rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-base">{plan.title}</div>
                  <div className="text-xs text-muted-foreground max-w-2xl truncate">{plan.subtitle}</div>
                </TableCell>
                <TableCell>{plan.planDay}</TableCell>
                <TableCell>{plan.planUsed}</TableCell>
                <TableCell>
                  <Button variant="destructive" className="w-20">Delete</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
  