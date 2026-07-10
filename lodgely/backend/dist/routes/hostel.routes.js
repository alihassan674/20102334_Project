"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Routes (routes/hostel.routes.ts)
//
// This file maps HTTP methods + URLs to controller functions.
// Express Router groups related endpoints together.
//
// Base path (mounted in index.ts): /api/hostels
//
// Available endpoints:
//   GET    /api/hostels       → list all hostels
//   GET    /api/hostels/:id   → get one hostel by ID
//   POST   /api/hostels       → create a new hostel
//   PUT    /api/hostels/:id   → update an existing hostel
//   DELETE /api/hostels/:id   → delete a hostel (cascades to rooms & students)
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostelRouter = void 0;
const express_1 = require("express");
// Import the actual logic functions from the hostel controller
const hostel_controller_1 = require("../controllers/hostel.controller");
// Create a new Express Router instance for hostel routes
exports.hostelRouter = (0, express_1.Router)();
// ── Route Definitions ─────────────────────────────────────────
// Each line connects an HTTP verb + path to a controller function.
exports.hostelRouter.get("/", hostel_controller_1.getAllHostels); // List all hostels
exports.hostelRouter.get("/:id", hostel_controller_1.getHostelById); // Get one hostel (by its UUID)
exports.hostelRouter.post("/", hostel_controller_1.createHostel); // Create a new hostel
exports.hostelRouter.put("/:id", hostel_controller_1.updateHostel); // Update hostel name/address/floors
exports.hostelRouter.delete("/:id", hostel_controller_1.deleteHostel); // Delete hostel (and all its rooms/students)
//# sourceMappingURL=hostel.routes.js.map