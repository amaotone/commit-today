import {
  type ActionFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { desc } from "drizzle-orm";
import { db } from "~/db";
import { type InsertTask, tasksTable } from "~/db/schema";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
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
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const task: InsertTask = {
    title,
  };

  try {
    const [insertedTask] = await db.insert(tasksTable).values(task).returning();
    return json({ task: insertedTask });
  } catch (error) {
    console.error("タスク追加エラー:", error);
    return json({ error: "タスクの追加に失敗しました" }, { status: 500 });
  }
};

export const loader = async () => {
  const tasks = await db
    .select()
    .from(tasksTable)
    .orderBy(desc(tasksTable.createdAt));
  return json({ tasks });
};

export default function Index() {
  const { tasks } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">タスク管理アプリ</h1>
      <Form method="post" className="mb-8 space-y-4">
        <div>
          <Label htmlFor="title">タスクタイトル</Label>
          <Input id="title" name="title" placeholder="タスクを入力" required />
        </div>
        <Button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting" ? "追加中..." : "タスクを追加"}
        </Button>
      </Form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タスク</TableHead>
            <TableHead>作成日時</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{new Date(task.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
