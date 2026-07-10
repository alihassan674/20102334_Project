"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Room Routes (routes/room.routes.ts)
//
// Maps HTTP methods + URLs to room controller functions.
//
// Base path (mounted in index.ts): /api/rooms
//
// Available endpoints:
//   GET    /api/rooms       → list rooms (supports ?hostelId, ?status, ?type filters)
//   GET    /api/rooms/:id   → get one room with its students list
//   POST   /api/rooms       → create a room inside a hostel
//   PUT    /api/rooms/:id   → update room details or status
//   DELETE /api/rooms/:id   → delete room (only if no students inside)
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = require("express");
// Import room controller functions
const room_controller_1 = require("../controllers/room.controller");
// Create the router for room-related endpoints
exports.roomRouter = (0, express_1.Router)();
// ── Route Definitions ─────────────────────────────────────────
exports.roomRouter.get("/", room_controller_1.getAllRooms); // List all rooms (with optional query filters)
exports.roomRouter.get("/:id", room_controller_1.getRoomById); // Get a single room with its students
exports.roomRouter.post("/", room_controller_1.createRoom); // Create a new room inside a hostel
exports.roomRouter.put("/:id", room_controller_1.updateRoom); // Update room number, floor, price, or status
exports.roomRouter.delete("/:id", room_controller_1.deleteRoom); // Delete a room (blocked if students are inside)
//# sourceMappingURL=room.routes.js.map