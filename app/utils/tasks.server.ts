import { asc, eq, max } from "drizzle-orm";
import { db } from "~/db";
import { type InsertTask, type SelectTask, tasksTable } from "~/db/schema";

export async function createTask(
  title: string,
): Promise<{ task: SelectTask } | { error: string }> {
  const [{ maxDisplayOrder }] = await db
    .select({ maxDisplayOrder: max(tasksTable.displayOrder) })
    .from(tasksTable);

  const newDisplayOrder = (maxDisplayOrder ?? 0) + 1;

  const task: InsertTask = {
    title,
    displayOrder: newDisplayOrder,
  };

  try {
    const [insertedTask] = await db.insert(tasksTable).values(task).returning();
    return { task: insertedTask };
  } catch (error) {
    console.error("タスク追加エラー:", error);
    return { error: "タスクの追加に失敗しました" };
  }
}

export async function reorderTasks(
  tasksJson: string,
): Promise<{ success: true } | { error: string }> {
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

    return { success: true };
  } catch (error) {
    console.error("タスク順序更新エラー:", error);
    return { error: "タスクの順序更新に失敗しました" };
  }
}

export async function getTasks(): Promise<SelectTask[]> {
  return db.select().from(tasksTable).orderBy(asc(tasksTable.displayOrder));
}
