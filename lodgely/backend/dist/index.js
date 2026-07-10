"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Server Entry Point (index.ts)
//
// This is the MAIN FILE that starts the whole backend server.
// Think of it as the "main()" function for our API.
// It:
//   1. Loads environment variables from .env
//   2. Creates the Express app
//   3. Registers global middleware (CORS, JSON parsing)
//   4. Mounts all API route groups
//   5. Attaches error handling
//   6. Starts listening on a port
// ─────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// express-async-errors patches Express so async errors are
// automatically caught and forwarded to our error handler.
// Without this, unhandled async errors would crash the server.
require("express-async-errors");
// Core framework and helpers
const express_1 = __importDefault(require("express")); // Express = our web server framework
const cors_1 = __importDefault(require("cors")); // CORS lets the browser (frontend) talk to this API
const dotenv_1 = __importDefault(require("dotenv")); // dotenv reads our .env file into process.env
// Import all route groups — each handles one "resource" (hostels, rooms, etc.)
const hostel_routes_1 = require("./routes/hostel.routes");
const room_routes_1 = require("./routes/room.routes");
const student_routes_1 = require("./routes/student.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
// Import our custom error handlers (defined in middleware/errorHandler.ts)
const errorHandler_1 = require("./middleware/errorHandler");
// ── Step 1: Load environment variables ───────────────────────
// This reads the .env file and makes values like DATABASE_URL
// and PORT available via process.env.PORT, etc.
dotenv_1.default.config();
// ── Step 2: Create the Express application ───────────────────
const app = (0, express_1.default)();
// PORT defaults to 5000 if not set in .env
const PORT = process.env.PORT || 5000;
// ── Step 3: Register Global Middleware ───────────────────────
// Middleware runs on EVERY incoming request before it hits a route.
// CORS: Allows the Next.js frontend (running on port 3000) to call this API.
// The browser blocks cross-origin requests by default — cors() lifts that restriction.
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
// express.json(): Parses incoming JSON request bodies (e.g., POST body data).
// Without this, req.body would always be undefined.
app.use(express_1.default.json());
// express.urlencoded: Parses form-encoded bodies (e.g., HTML form submissions).
app.use(express_1.default.urlencoded({ extended: true }));
// ── Step 4: Health Check Endpoint ────────────────────────────
// A simple GET /api/health route that returns "ok".
// Useful to verify the server is running — GCM load balancers ping this too.
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), service: "lodgely-api" });
});
// ── Step 5: Mount API Route Groups ───────────────────────────
// Each router handles all endpoints for one "resource".
// e.g. hostelRouter handles GET /api/hostels, POST /api/hostels, etc.
app.use("/api/hostels", hostel_routes_1.hostelRouter); // Hostel CRUD
app.use("/api/rooms", room_routes_1.roomRouter); // Room CRUD
app.use("/api/students", student_routes_1.studentRouter); // Student registration/checkout
app.use("/api/analytics", analytics_routes_1.analyticsRouter); // Dashboard statistics
// ── Step 6: Error Handling Middleware ────────────────────────
// These must be registered AFTER all routes.
// notFoundHandler: catches any request that didn't match a route above → 404
// globalErrorHandler: catches any error thrown anywhere in the app → JSON error response
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
// ── Step 7: Start the Server ─────────────────────────────────
// app.listen() starts accepting HTTP connections on the given port.
app.listen(PORT, () => {
    console.log(`\n  🏨  Lodgely API running at http://localhost:${PORT}`);
    console.log(`  📊  Health check:  http://localhost:${PORT}/api/health\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map