import { Router, type IRouter } from "express";
import healthRouter from "./health";
import healthLogsRouter from "./health-logs";
import goalsRouter from "./goals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(healthLogsRouter);
router.use(goalsRouter);

export default router;
