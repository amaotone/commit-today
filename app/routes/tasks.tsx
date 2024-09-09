import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { TaskList } from "~/components/TaskList";
import { getTasks } from "~/utils/tasks.server";

export const loader = async () => {
  const tasks = await getTasks();
  return typedjson({ tasks });
};

export default function Tasks() {
  const { tasks } = useTypedLoaderData<typeof loader>();

  return (
    <div>
      <TaskList tasks={tasks} />
    </div>
  );
}
