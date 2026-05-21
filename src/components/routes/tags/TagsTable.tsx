import { Pecha } from "@/components/ui/shadimport";
import { IoMdCreate, IoMdTrash } from "react-icons/io";
import defaultCover from "/default-image.webp";
import type { Tag } from "./api/tagsApi";

interface TagsTableProps {
  tags: Tag[];
  isLoading?: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

const TagsTable = ({ tags, isLoading, onEdit, onDelete }: TagsTableProps) => {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading tags...
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Pecha.Table>
        <Pecha.TableHeader>
          <Pecha.TableRow>
            <Pecha.TableHead className="w-20">Image</Pecha.TableHead>
            <Pecha.TableHead>Name</Pecha.TableHead>
            <Pecha.TableHead>Description</Pecha.TableHead>
            <Pecha.TableHead className="w-24">Plans</Pecha.TableHead>
            <Pecha.TableHead className="w-28 text-right">Actions</Pecha.TableHead>
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <Pecha.TableBody>
          {tags.map((tag) => (
            <Pecha.TableRow key={tag.id}>
              <Pecha.TableCell>
                <img
                  src={tag.image || defaultCover}
                  alt={tag.name}
                  className="w-12 h-12 object-cover rounded-md border"
                />
              </Pecha.TableCell>
              <Pecha.TableCell className="font-medium">{tag.name}</Pecha.TableCell>
              <Pecha.TableCell className="text-muted-foreground max-w-xs truncate">
                {tag.description || "—"}
              </Pecha.TableCell>
              <Pecha.TableCell>{tag.plan_ids.length}</Pecha.TableCell>
              <Pecha.TableCell>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(tag)}
                    className="p-2 rounded-md border hover:bg-muted/50 transition-colors"
                    aria-label={`Edit ${tag.name}`}
                  >
                    <IoMdCreate className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(tag)}
                    className="p-2 rounded-md border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    aria-label={`Delete ${tag.name}`}
                  >
                    <IoMdTrash className="w-4 h-4" />
                  </button>
                </div>
              </Pecha.TableCell>
            </Pecha.TableRow>
          ))}
        </Pecha.TableBody>
      </Pecha.Table>
    </div>
  );
};

export default TagsTable;
