import { Button } from "@/components/ui/atoms/button";
import { ButtonGroup } from "@/components/ui/atoms/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/atoms/dropdown-menu";
import { IoMdTrash } from "react-icons/io";
import { FaPen } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

export function DropdownButton() {
  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <BsThreeDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="[--radius:1rem]">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <FaPen className="h-4 w-4" />
              Edit Plan
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <IoMdTrash className="h-4 w-4" />
              Delete Plan
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
