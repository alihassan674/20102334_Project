// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Routes (routes/analytics.routes.ts)
//
// Maps HTTP methods + URLs to analytics controller functions.
//
// Base path (mounted in index.ts): /api/analytics
//
// Available endpoints:
//   GET /api/analytics/dashboard → returns all dashboard stats in one call
//       (total hostels, rooms, students, occupancy rate, revenue, charts data)
// ─────────────────────────────────────────────────────────────

import { Router } from "express";

// Import the single analytics function
import { getDashboardAnalytics } from "../controllers/analytics.controller";

// Create the router for analytics endpoints
export const analyticsRouter = Router();

// ── Route Definitions ─────────────────────────────────────────

// GET /api/analytics/dashboard
// Returns aggregated metrics used by the frontend dashboard
analyticsRouter.get("/dashboard", getDashboardAnalytics);
