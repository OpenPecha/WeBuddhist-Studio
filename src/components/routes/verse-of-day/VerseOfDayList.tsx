import { useQuery } from "@tanstack/react-query";
import { Pecha } from "@/components/ui/shadimport";
import { Button } from "@/components/ui/atoms/button";
import {
  fetchVerseOfDayList,
  type VerseOfDayItem,
} from "./api/verseOfDayApi";
import { format } from "date-fns";

interface VerseOfDayListProps {
  onEdit: (item: VerseOfDayItem) => void;
  onDelete: (item: VerseOfDayItem) => void;
}

const VerseOfDayList = ({ onEdit, onDelete }: VerseOfDayListProps) => {

  const { data, isLoading } = useQuery({
    queryKey: ["verse-of-day-list"],
    queryFn: fetchVerseOfDayList,
  });

  const sortedVerses = data?.verses
    ? [...data.verses].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!sortedVerses.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No verses found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Pecha.Table>
          <Pecha.TableHeader>
            <Pecha.TableRow>
              <Pecha.TableHead>Verses</Pecha.TableHead>
              <Pecha.TableHead>Image</Pecha.TableHead>
              <Pecha.TableHead>Date</Pecha.TableHead>
              <Pecha.TableHead>Group</Pecha.TableHead>
              <Pecha.TableHead className="text-right">Actions</Pecha.TableHead>
            </Pecha.TableRow>
          </Pecha.TableHeader>
          <Pecha.TableBody>
            {sortedVerses.map((verse) => (
              <Pecha.TableRow key={verse.id}>
                <Pecha.TableCell className="max-w-xs">
                  <p className="truncate text-sm">
                    {verse.verses.en || verse.verses.bo || verse.verses.zh}
                  </p>
                </Pecha.TableCell>
                <Pecha.TableCell>
                  {verse.image_url ? (
                    <img
                      src={verse.image_url}
                      alt="Verse"
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted" />
                  )}
                </Pecha.TableCell>
                <Pecha.TableCell>
                  {format(new Date(verse.date), "MMM dd, yyyy")}
                </Pecha.TableCell>
                <Pecha.TableCell>
                  {verse.group_info?.[0]?.title || "—"}
                </Pecha.TableCell>
                <Pecha.TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(verse)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(verse)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </Pecha.TableCell>
              </Pecha.TableRow>
            ))}
          </Pecha.TableBody>
        </Pecha.Table>
      </div>
    </>
  );
};

export default VerseOfDayList;
