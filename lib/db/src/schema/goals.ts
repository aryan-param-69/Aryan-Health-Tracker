import { pgTable, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  stepsGoal: integer("steps_goal").notNull().default(10000),
  hydrationGoalMl: integer("hydration_goal_ml").notNull().default(2500),
  sleepGoalHours: real("sleep_goal_hours").notNull().default(8),
  caloriesGoalKcal: integer("calories_goal_kcal").notNull().default(2000),
});

export const insertGoalsSchema = createInsertSchema(goalsTable).omit({ id: true });
export type InsertGoals = z.infer<typeof insertGoalsSchema>;
export type Goals = typeof goalsTable.$inferSelect;
