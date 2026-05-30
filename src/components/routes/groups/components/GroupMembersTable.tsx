import { Pecha } from "@/components/ui/shadimport";
import type { AuthorGroupMemberDTO } from "../api/groupsApi";

type GroupMembersTableProps = {
  members: AuthorGroupMemberDTO[];
};

const GroupMembersTable = ({ members }: GroupMembersTableProps) => (
  <div className="overflow-x-auto">
    <Pecha.Table>
      <Pecha.TableHeader>
        <Pecha.TableRow>
          <Pecha.TableHead>Name</Pecha.TableHead>
          <Pecha.TableHead>Email</Pecha.TableHead>
          <Pecha.TableHead>Role</Pecha.TableHead>
        </Pecha.TableRow>
      </Pecha.TableHeader>
      <Pecha.TableBody>
        {members.map((member) => (
          <Pecha.TableRow key={member.author_id}>
            <Pecha.TableCell>
              {member.firstname} {member.lastname}
            </Pecha.TableCell>
            <Pecha.TableCell className="text-muted-foreground">
              {member.email}
            </Pecha.TableCell>
            <Pecha.TableCell>{member.role}</Pecha.TableCell>
          </Pecha.TableRow>
        ))}
      </Pecha.TableBody>
    </Pecha.Table>
  </div>
);

export default GroupMembersTable;
