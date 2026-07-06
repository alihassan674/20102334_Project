"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Server Entry Point
// ─────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const hostel_routes_1 = require("./routes/hostel.routes");
const room_routes_1 = require("./routes/room.routes");
const student_routes_1 = require("./routes/student.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ── Global Middleware ────────────────────────────────────────
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), service: "lodgely-api" });
});
// ── API Routes ───────────────────────────────────────────────
app.use("/api/hostels", hostel_routes_1.hostelRouter);
app.use("/api/rooms", room_routes_1.roomRouter);
app.use("/api/students", student_routes_1.studentRouter);
app.use("/api/analytics", analytics_routes_1.analyticsRouter);
// ── Error Handling ───────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  🏨  Lodgely API running at http://localhost:${PORT}`);
    console.log(`  📊  Health check:  http://localhost:${PORT}/api/health\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map