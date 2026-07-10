"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
// Import the single analytics function
const analytics_controller_1 = require("../controllers/analytics.controller");
// Create the router for analytics endpoints
exports.analyticsRouter = (0, express_1.Router)();
// ── Route Definitions ─────────────────────────────────────────
// GET /api/analytics/dashboard
// Returns aggregated metrics used by the frontend dashboard
exports.analyticsRouter.get("/dashboard", analytics_controller_1.getDashboardAnalytics);
//# sourceMappingURL=analytics.routes.js.map