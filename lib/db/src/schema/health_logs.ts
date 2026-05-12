import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const healthLogsTable = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  steps: integer("steps").notNull().default(0),
  hydrationMl: integer("hydration_ml").notNull().default(0),
  sleepHours: real("sleep_hours").notNull().default(0),
  caloriesKcal: integer("calories_kcal").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHealthLogSchema = createInsertSchema(healthLogsTable).omit({ id: true, createdAt: true });
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;
export type HealthLog = typeof healthLogsTable.$inferSelect;
