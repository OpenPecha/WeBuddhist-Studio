import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import { type PoemItem } from "./api/poemApi";
import { format } from "date-fns";

interface PoemsListProps {
  poems: PoemItem[];
  isLoading?: boolean;
  showActionsColumn?: boolean;
  onEdit: (item: PoemItem) => void;
  onDelete: (item: PoemItem) => void;
}

const StatusBadge = ({ status }: { status: PoemItem["status"] }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      status === "PUBLISHED"
        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {status === "PUBLISHED" ? "Published" : "Draft"}
  </span>
);

const PoemsList = ({
  poems,
  isLoading,
  showActionsColumn = true,
  onEdit,
  onDelete,
}: PoemsListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!poems.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No poems found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white dark:bg-[#1E1E1E]">
      <Pecha.Table>
        <Pecha.TableHeader>
          <Pecha.TableRow>
            <Pecha.TableHead className="w-[100px]">Image</Pecha.TableHead>
            <Pecha.TableHead className="w-[280px]">Title</Pecha.TableHead>
            <Pecha.TableHead className="w-[160px]">Author</Pecha.TableHead>
            <Pecha.TableHead className="w-[160px]">Chapter</Pecha.TableHead>
            <Pecha.TableHead className="w-[90px]">Language</Pecha.TableHead>
            <Pecha.TableHead className="w-[110px]">Status</Pecha.TableHead>
            <Pecha.TableHead className="w-[150px]">Updated</Pecha.TableHead>
            {showActionsColumn ? (
              <Pecha.TableHead className="w-[180px] text-right">
                Actions
              </Pecha.TableHead>
            ) : null}
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <Pecha.TableBody>
          {poems.map((poem) => (
            <Pecha.TableRow key={poem.id}>
              <Pecha.TableCell>
                {poem.image_url ? (
                  <img
                    src={poem.image_url}
                    alt={poem.title}
                    className="h-12 w-12 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted" />
                )}
              </Pecha.TableCell>
              <Pecha.TableCell className="max-w-[280px]">
                <p className="text-sm font-medium line-clamp-2">
                  {poem.title}
                </p>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <p className="truncate text-sm">{poem.author_name}</p>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <p className="truncate text-sm">{poem.chapter_name || "—"}</p>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <span className="text-sm text-muted-foreground">
                  {poem.language}
                </span>
              </Pecha.TableCell>
              <Pecha.TableCell>
                <StatusBadge status={poem.status} />
              </Pecha.TableCell>
              <Pecha.TableCell className="whitespace-nowrap">
                {format(new Date(poem.updated_at), "MMM dd, yyyy")}
              </Pecha.TableCell>
              {showActionsColumn ? (
                <Pecha.TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(poem)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(poem)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
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

export default PoemsList;
