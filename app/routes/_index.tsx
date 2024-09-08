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
    const [insertedTask] = await db.insert(tasksTable).values(task);
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
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl mb-4">タスク管理アプリ</h1>
      <Form method="post" className="mb-4">
        <div className="mb-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            タスクタイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" ? "追加中..." : "タスクを追加"}
        </button>
      </Form>
      {actionData?.error && (
        <p className="text-red-500 mt-2">{actionData.error}</p>
      )}
      {actionData?.task && (
        <p className="text-green-500 mt-2">
          タスクが追加されました: {actionData.task.title}
        </p>
      )}
      <ul>
        {data.tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
