import { Router, type IRouter } from "express";
import { eq, gte, lte, desc } from "drizzle-orm";
import { db, healthLogsTable } from "@workspace/db";
import {
  ListHealthLogsQueryParams,
  CreateHealthLogBody,
  GetHealthLogParams,
  UpdateHealthLogParams,
  UpdateHealthLogBody,
  DeleteHealthLogParams,
  ListHealthLogsResponse,
  ListHealthLogsResponseItem,
  GetTodayLogResponse,
  GetDailySummaryResponse,
  GetWeeklyTrendResponse,
  GetHealthLogResponse,
  UpdateHealthLogResponse,
} from "@workspace/api-zod";
import { goalsTable } from "@workspace/db";

const router: IRouter = Router();

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

router.get("/health-logs/today", async (req, res): Promise<void> => {
  const today = todayStr();
  const [log] = await db
    .select()
    .from(healthLogsTable)
    .where(eq(healthLogsTable.date, today));

  if (!log) {
    const empty = {
      id: 0,
      date: today,
      steps: 0,
      hydrationMl: 0,
      sleepHours: 0,
      caloriesKcal: 0,
      notes: null,
      createdAt: new Date().toISOString(),
    };
    res.json(GetTodayLogResponse.parse(empty));
    return;
  }

  res.json(GetTodayLogResponse.parse({ ...log, createdAt: log.createdAt.toISOString() }));
});

router.get("/health-logs/summary", async (req, res): Promise<void> => {
  const today = todayStr();

  const [log] = await db
    .select()
    .from(healthLogsTable)
    .where(eq(healthLogsTable.date, today));

  const [goals] = await db.select().from(goalsTable).limit(1);

  const g = goals ?? { stepsGoal: 10000, hydrationGoalMl: 2500, sleepGoalHours: 8, caloriesGoalKcal: 2000 };
  const l = log ?? { steps: 0, hydrationMl: 0, sleepHours: 0, caloriesKcal: 0 };

  const stepsPercent = Math.min(100, Math.round((l.steps / g.stepsGoal) * 100));
  const hydrationPercent = Math.min(100, Math.round((l.hydrationMl / g.hydrationGoalMl) * 100));
  const sleepPercent = Math.min(100, Math.round((l.sleepHours / g.sleepGoalHours) * 100));
  const caloriesPercent = Math.min(100, Math.round((l.caloriesKcal / g.caloriesGoalKcal) * 100));
  const overallScore = Math.round((stepsPercent + hydrationPercent + sleepPercent + caloriesPercent) / 4);

  const summary = {
    date: today,
    steps: l.steps,
    hydrationMl: l.hydrationMl,
    sleepHours: l.sleepHours,
    caloriesKcal: l.caloriesKcal,
    stepsGoal: g.stepsGoal,
    hydrationGoalMl: g.hydrationGoalMl,
    sleepGoalHours: g.sleepGoalHours,
    caloriesGoalKcal: g.caloriesGoalKcal,
    stepsPercent,
    hydrationPercent,
    sleepPercent,
    caloriesPercent,
    overallScore,
  };

  res.json(GetDailySummaryResponse.parse(summary));
});

router.get("/health-logs/trend", async (req, res): Promise<void> => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const startDate = sevenDaysAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const logs = await db
    .select()
    .from(healthLogsTable)
    .where(gte(healthLogsTable.date, startDate))
    .orderBy(healthLogsTable.date);

  const logsByDate = new Map(logs.map((l) => [l.date, l]));
  const trend = [];
  for (let d = new Date(sevenDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const log = logsByDate.get(dateStr);
    trend.push({
      date: dateStr,
      steps: log?.steps ?? 0,
      hydrationMl: log?.hydrationMl ?? 0,
      sleepHours: log?.sleepHours ?? 0,
      caloriesKcal: log?.caloriesKcal ?? 0,
    });
  }

  res.json(GetWeeklyTrendResponse.parse(trend));
});

router.get("/health-logs", async (req, res): Promise<void> => {
  const queryParsed = ListHealthLogsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const { startDate, endDate, limit } = queryParsed.data;

  let query = db.select().from(healthLogsTable).$dynamic();

  if (startDate) {
    query = query.where(gte(healthLogsTable.date, startDate));
  }
  if (endDate) {
    query = query.where(lte(healthLogsTable.date, endDate));
  }

  query = query.orderBy(desc(healthLogsTable.date));

  if (limit) {
    query = query.limit(limit);
  }

  const logs = await query;
  res.json(ListHealthLogsResponse.parse(logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))));
});

router.post("/health-logs", async (req, res): Promise<void> => {
  const parsed = CreateHealthLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(healthLogsTable)
    .where(eq(healthLogsTable.date, parsed.data.date));

  let log;
  if (existing.length > 0) {
    const { date, ...updateData } = parsed.data;
    [log] = await db
      .update(healthLogsTable)
      .set(updateData)
      .where(eq(healthLogsTable.date, parsed.data.date))
      .returning();
  } else {
    [log] = await db.insert(healthLogsTable).values(parsed.data).returning();
  }

  res.status(201).json(ListHealthLogsResponseItem.parse({ ...log, createdAt: log.createdAt.toISOString() }));
});

router.get("/health-logs/:id", async (req, res): Promise<void> => {
  const params = GetHealthLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [log] = await db
    .select()
    .from(healthLogsTable)
    .where(eq(healthLogsTable.id, params.data.id));

  if (!log) {
    res.status(404).json({ error: "Health log not found" });
    return;
  }

  res.json(GetHealthLogResponse.parse({ ...log, createdAt: log.createdAt.toISOString() }));
});

router.patch("/health-logs/:id", async (req, res): Promise<void> => {
  const params = UpdateHealthLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateHealthLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db
    .update(healthLogsTable)
    .set(parsed.data)
    .where(eq(healthLogsTable.id, params.data.id))
    .returning();

  if (!log) {
    res.status(404).json({ error: "Health log not found" });
    return;
  }

  res.json(UpdateHealthLogResponse.parse({ ...log, createdAt: log.createdAt.toISOString() }));
});

router.delete("/health-logs/:id", async (req, res): Promise<void> => {
  const params = DeleteHealthLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [log] = await db
    .delete(healthLogsTable)
    .where(eq(healthLogsTable.id, params.data.id))
    .returning();

  if (!log) {
    res.status(404).json({ error: "Health log not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
