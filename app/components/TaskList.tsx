import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useActionData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { TaskRow } from "~/components/TaskRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { SelectTask } from "~/db/schema";

interface TaskListProps {
  tasks: SelectTask[];
}

export function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const submit = useSubmit();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newTasks = arrayMove(items, oldIndex, newIndex).map(
          (task, index) => ({
            ...task,
            displayOrder: index + 1,
          }),
        );

        submit(
          {
            intent: "reorder",
            tasks: JSON.stringify(
              newTasks.map((task) => ({
                id: task.id,
                displayOrder: task.displayOrder,
              })),
            ),
          },
          { method: "post" },
        );

        return newTasks;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タスク</TableHead>
            <TableHead>表示順</TableHead>
            <TableHead>作成日時</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <TableBody>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}
