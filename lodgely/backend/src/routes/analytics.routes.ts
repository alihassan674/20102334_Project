// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.get("/dashboard", getDashboardAnalytics);
