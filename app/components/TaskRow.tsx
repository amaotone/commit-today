import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@radix-ui/react-icons";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
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
      <TableCell>{task.displayOrder}</TableCell>
      <TableCell>{new Date(task.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="taskId" value={task.id} />
          <Button type="submit" variant="destructive" size="sm">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </Form>
      </TableCell>
    </TableRow>
  );
}
