"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Routes
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.get("/dashboard", analytics_controller_1.getDashboardAnalytics);
//# sourceMappingURL=analytics.routes.js.map