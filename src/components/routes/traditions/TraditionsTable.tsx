import { Pecha } from "@/components/ui/shadimport";
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import type { Tradition } from "./api/traditionsApi";
import { capitalizeFirstLetter } from "@/lib/textUtils";

interface TraditionsTableProps {
  traditions: Tradition[];
  isLoading?: boolean;
  showActionsColumn?: boolean;
  onEdit: (tradition: Tradition) => void;
  onDelete: (tradition: Tradition) => void;
}

const TraditionsTable = ({
  traditions,
  isLoading,
  showActionsColumn = true,
  onEdit,
  onDelete,
}: TraditionsTableProps) => {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading traditions...
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Pecha.Table>
        <Pecha.TableHeader>
          <Pecha.TableRow>
            <Pecha.TableHead>Code</Pecha.TableHead>
            <Pecha.TableHead>Name</Pecha.TableHead>
            <Pecha.TableHead>Regions</Pecha.TableHead>
            {showActionsColumn ? (
              <Pecha.TableHead className="w-28 text-right">
                Actions
              </Pecha.TableHead>
            ) : null}
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <Pecha.TableBody>
          {traditions.map((tradition) => (
            <Pecha.TableRow key={tradition.id}>
              <Pecha.TableCell>
                <code className="text-sm">{tradition.code}</code>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    {capitalizeFirstLetter(tradition.name?.trim() || "Untitled")}
                  </span>
                  {tradition.metadata?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tradition.metadata.map((meta) => (
                        <span
                          key={meta.id}
                          className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {meta.language}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <span className="text-sm text-muted-foreground">
                  {tradition.regions?.length
                    ? tradition.regions.join(", ")
                    : "—"}
                </span>
              </Pecha.TableCell>
              {showActionsColumn ? (
                <Pecha.TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(tradition)}
                      className="p-2 rounded-md border hover:bg-muted/50 transition-colors"
                      aria-label={`Edit ${capitalizeFirstLetter(tradition.name?.trim() || "Untitled")}`}
                    >
                      <IoMdCreate className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tradition)}
                      className="p-2 rounded-md border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label={`Delete ${capitalizeFirstLetter(tradition.name?.trim() || "Untitled")}`}
                    >
                      <IoMdTrash className="w-4 h-4" />
                    </button>
                  </div>
                </Pecha.TableCell>
              ) : null}
            </Pecha.TableRow>
          ))}
        </Pecha.TableBody>
      </Pecha.Table>
    </div>
  );
};

export default TraditionsTable;
