import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  useNavigation,
  useRevalidator,
  useSubmit,
} from "@remix-run/react";
import { asc, eq, max } from "drizzle-orm";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import { db } from "~/db";
import { type InsertTask, tasksTable } from "~/db/schema";

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
import { useEffect, useState } from "react";
import { TaskRow } from "~/components/TaskRow";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const meta: MetaFunction = () => {
  return [
    { title: "タスク管理アプリ" },
    { name: "description", content: "シンプルなタスク管理アプリです" },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = formData.get("title");

    if (typeof title !== "string" || title.length === 0) {
      return typedjson({ error: "タイトルは必須です" }, { status: 400 });
    }

    const [{ maxDisplayOrder }] = await db
      .select({ maxDisplayOrder: max(tasksTable.displayOrder) })
      .from(tasksTable);

    const newDisplayOrder = (maxDisplayOrder ?? 0) + 1;

    const task: InsertTask = {
      title,
      displayOrder: newDisplayOrder,
    };

    try {
      const [insertedTask] = await db
        .insert(tasksTable)
        .values(task)
        .returning();
      return typedjson({ task: insertedTask });
    } catch (error) {
      console.error("タスク追加エラー:", error);
      return typedjson(
        { error: "タスクの追加に失敗しました" },
        { status: 500 },
      );
    }
  } else if (intent === "reorder") {
    const tasksJson = formData.get("tasks");

    if (typeof tasksJson !== "string") {
      return typedjson({ error: "Invalid request" }, { status: 400 });
    }

    const tasks = JSON.parse(tasksJson);

    try {
      await db.transaction(async (tx) => {
        for (const task of tasks) {
          await tx
            .update(tasksTable)
            .set({ displayOrder: task.displayOrder })
            .where(eq(tasksTable.id, task.id));
        }
      });

      return typedjson({ success: true });
    } catch (error) {
      console.error("タスク順序更新エラー:", error);
      return typedjson(
        { error: "タスクの順序更新に失敗しました" },
        { status: 500 },
      );
    }
  }

  return typedjson({ error: "Invalid intent" }, { status: 400 });
};

export const loader = async () => {
  const tasks = await db
    .select()
    .from(tasksTable)
    .orderBy(asc(tasksTable.displayOrder));
  return typedjson({ tasks });
};

export default function Index() {
  const actionData = useTypedActionData<typeof action>();
  const { tasks: initialTasks } = useTypedLoaderData<typeof loader>();
  const [tasks, setTasks] = useState(initialTasks);
  const navigation = useNavigation();
  const submit = useSubmit();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (actionData && "task" in actionData) {
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">タスク管理アプリ</h1>
      <Form method="post" className="mb-8 space-y-4">
        <input type="hidden" name="intent" value="create" />
        <div>
          <Label htmlFor="title">タスクタイトル</Label>
          <Input id="title" name="title" placeholder="タスクを入力" required />
        </div>
        <Button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "追加中..." : "タスクを追加"}
        </Button>
      </Form>
      {actionData && "error" in actionData && (
        <p className="text-red-500 mb-4">{actionData.error}</p>
      )}
      {actionData && "task" in actionData && (
        <p className="text-green-500 mb-4">
          タスクが追加されました: {actionData.task.title}
        </p>
      )}

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
    </div>
  );
}
