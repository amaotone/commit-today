import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  typedjson,
  useTypedActionData,
  useTypedLoaderData,
} from "remix-typedjson";
import { TaskForm } from "~/components/TaskForm";
import { TaskList } from "~/components/TaskList";
import { createTask, getTasks, reorderTasks } from "~/utils/tasks.server";

export const meta: MetaFunction = () => [
  { title: "タスク管理アプリ" },
  { name: "description", content: "シンプルなタスク管理アプリです" },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = formData.get("title");
    if (typeof title !== "string" || title.length === 0) {
      return typedjson({ error: "タイトルは必須です" }, { status: 400 });
    }
    return typedjson(await createTask(title));
  }

  if (intent === "reorder") {
    const tasksJson = formData.get("tasks");
    if (typeof tasksJson !== "string") {
      return typedjson({ error: "Invalid request" }, { status: 400 });
    }
    return typedjson(await reorderTasks(tasksJson));
  }

  return typedjson({ error: "Invalid intent" }, { status: 400 });
};

export const loader = async () => {
  const tasks = await getTasks();
  return typedjson({ tasks });
};

export default function Index() {
  const actionData = useTypedActionData<typeof action>();
  const { tasks } = useTypedLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">タスク管理アプリ</h1>
      <TaskForm />
      {actionData && "error" in actionData && (
        <p className="text-red-500 mb-4">{actionData.error}</p>
      )}
      {actionData && "task" in actionData && (
        <p className="text-green-500 mb-4">
          タスクが追加されました: {actionData.task.title}
        </p>
      )}
      <TaskList tasks={tasks} />
    </div>
  );
}
