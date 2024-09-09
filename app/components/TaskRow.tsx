import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "~/components/ui/table";
import type { SelectTask } from "~/db/schema";

interface TaskRowProps {
  task: SelectTask;
}

export function TaskRow({ task }: TaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>{task.title}</TableCell>
    </TableRow>
  );
}
