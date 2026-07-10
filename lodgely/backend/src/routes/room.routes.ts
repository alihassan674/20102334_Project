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

import { Router } from "express";

// Import room controller functions
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller";

// Create the router for room-related endpoints
export const roomRouter = Router();

// ── Route Definitions ─────────────────────────────────────────

roomRouter.get("/", getAllRooms);         // List all rooms (with optional query filters)
roomRouter.get("/:id", getRoomById);     // Get a single room with its students
roomRouter.post("/", createRoom);        // Create a new room inside a hostel
roomRouter.put("/:id", updateRoom);      // Update room number, floor, price, or status
roomRouter.delete("/:id", deleteRoom);  // Delete a room (blocked if students are inside)
