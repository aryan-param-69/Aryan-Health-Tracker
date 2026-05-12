import { Router, type IRouter } from "express";
import { db, goalsTable } from "@workspace/db";
import { GetGoalsResponse, UpdateGoalsBody, UpdateGoalsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/goals", async (req, res): Promise<void> => {
  let [goals] = await db.select().from(goalsTable).limit(1);

  if (!goals) {
    [goals] = await db
      .insert(goalsTable)
      .values({
        stepsGoal: 10000,
        hydrationGoalMl: 2500,
        sleepGoalHours: 8,
        caloriesGoalKcal: 2000,
      })
      .returning();
  }

  res.json(GetGoalsResponse.parse(goals));
});

router.put("/goals", async (req, res): Promise<void> => {
  const parsed = UpdateGoalsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [existing] = await db.select().from(goalsTable).limit(1);

  let goals;
  if (!existing) {
    [goals] = await db
      .insert(goalsTable)
      .values({
        stepsGoal: 10000,
        hydrationGoalMl: 2500,
        sleepGoalHours: 8,
        caloriesGoalKcal: 2000,
        ...parsed.data,
      })
      .returning();
  } else {
    [goals] = await db
      .update(goalsTable)
      .set(parsed.data)
      .returning();
  }

  res.json(UpdateGoalsResponse.parse(goals));
});

export default router;
