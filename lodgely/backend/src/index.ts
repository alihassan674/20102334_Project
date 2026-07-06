// ─────────────────────────────────────────────────────────────
// Lodgely — Server Entry Point
// ─────────────────────────────────────────────────────────────

import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { hostelRouter } from "./routes/hostel.routes";
import { roomRouter } from "./routes/room.routes";
import { studentRouter } from "./routes/student.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "lodgely-api" });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api/hostels", hostelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/students", studentRouter);
app.use("/api/analytics", analyticsRouter);

// ── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🏨  Lodgely API running at http://localhost:${PORT}`);
  console.log(`  📊  Health check:  http://localhost:${PORT}/api/health\n`);
});

export default app;
