import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const tasksTable = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(createId),
  title: text("title").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertTask = typeof tasksTable.$inferInsert;
export type SelectTask = typeof tasksTable.$inferSelect;
