import { Pecha } from "@/components/ui/shadimport";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/atoms/sheet";

interface SourceSelectorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSource: (sourceContent: string) => void;
}

export const SourceSelectorSheet = ({
  isOpen,
  onOpenChange,
  onAddSource,
}: SourceSelectorSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddSource = () => {
    if (searchQuery.trim()) {
      onAddSource(searchQuery);
      setSearchQuery("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Source</SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Pecha.Input
              type="text"
              placeholder="Search for a source..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Pecha.Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Pecha.Button>
          <Pecha.Button
            type="button"
            onClick={handleAddSource}
            disabled={!searchQuery.trim()}
          >
            Add
          </Pecha.Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
