import { Pecha } from "@/components/ui/shadimport";
import { IoMdCreate } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import {
  pickGroupTitle,
  type AuthorGroupListItem,
} from "./api/groupsApi";
import GroupTitleWithAvatar from "./components/GroupTitleWithAvatar";

interface GroupsTableProps {
  groups: AuthorGroupListItem[];
  isLoading?: boolean;
}

const GroupsTable = ({ groups, isLoading }: GroupsTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading groups…
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Pecha.Table>
        <Pecha.TableHeader>
          <Pecha.TableRow>
            <Pecha.TableHead>Title</Pecha.TableHead>
            <Pecha.TableHead>Slug</Pecha.TableHead>
            <Pecha.TableHead>Visibility</Pecha.TableHead>
            <Pecha.TableHead>Members</Pecha.TableHead>
            <Pecha.TableHead>Followers</Pecha.TableHead>
            <Pecha.TableHead>Tags</Pecha.TableHead>
            <Pecha.TableHead className="w-20 text-right">Actions</Pecha.TableHead>
          </Pecha.TableRow>
        </Pecha.TableHeader>
        <Pecha.TableBody>
          {groups.map((group) => (
            <Pecha.TableRow
              key={group.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => navigate(ROUTES.group(group.id))}
            >
              <Pecha.TableCell className="font-medium max-w-xs">
                <GroupTitleWithAvatar
                  title={pickGroupTitle(group.metadata)}
                  size="sm"
                />
              </Pecha.TableCell>
              <Pecha.TableCell className="text-muted-foreground font-mono text-sm">
                {group.slug}
              </Pecha.TableCell>
              <Pecha.TableCell>
                {group.is_public ? (
                  <span className="text-green-600 dark:text-green-400">Public</span>
                ) : (
                  <span className="text-muted-foreground">Private</span>
                )}
              </Pecha.TableCell>
              <Pecha.TableCell>{group.member_count}</Pecha.TableCell>
              <Pecha.TableCell>{group.follower_count}</Pecha.TableCell>
              <Pecha.TableCell>{group.tags.length}</Pecha.TableCell>
              <Pecha.TableCell>
                <div className="flex justify-end">
                  <Link
                    to={ROUTES.groupEdit(group.id)}
                    className="p-2 rounded-md border hover:bg-muted/50 transition-colors inline-flex"
                    aria-label={`Edit ${pickGroupTitle(group.metadata)}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IoMdCreate className="w-4 h-4" />
                  </Link>
                </div>
              </Pecha.TableCell>
            </Pecha.TableRow>
          ))}
        </Pecha.TableBody>
      </Pecha.Table>
    </div>
  );
};

export default GroupsTable;
