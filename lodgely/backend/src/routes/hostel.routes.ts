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

import { Router } from "express";

// Import the actual logic functions from the hostel controller
import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from "../controllers/hostel.controller";

// Create a new Express Router instance for hostel routes
export const hostelRouter = Router();

// ── Route Definitions ─────────────────────────────────────────
// Each line connects an HTTP verb + path to a controller function.

hostelRouter.get("/", getAllHostels);         // List all hostels
hostelRouter.get("/:id", getHostelById);     // Get one hostel (by its UUID)
hostelRouter.post("/", createHostel);        // Create a new hostel
hostelRouter.put("/:id", updateHostel);      // Update hostel name/address/floors
hostelRouter.delete("/:id", deleteHostel);  // Delete hostel (and all its rooms/students)
