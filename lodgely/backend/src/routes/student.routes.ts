// ─────────────────────────────────────────────────────────────
// Lodgely — Student Routes (routes/student.routes.ts)
//
// Maps HTTP methods + URLs to student controller functions.
//
// Base path (mounted in index.ts): /api/students
//
// Available endpoints:
//   GET    /api/students       → list students (supports ?hostelId, ?roomId, ?search)
//   GET    /api/students/:id   → get one student with their room/hostel info
//   POST   /api/students       → register a new student (assigns them to a room)
//   PUT    /api/students/:id   → update student info (name, email, phone)
//   DELETE /api/students/:id   → check-out a student (frees their bed)
// ─────────────────────────────────────────────────────────────

import { Router } from "express";

// Import student controller functions
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller";

// Create the router for student-related endpoints
export const studentRouter = Router();

// ── Route Definitions ─────────────────────────────────────────

studentRouter.get("/", getAllStudents);         // List all students (filterable)
studentRouter.get("/:id", getStudentById);     // Get one student by UUID
studentRouter.post("/", createStudent);        // Register student + auto-update room status
studentRouter.put("/:id", updateStudent);      // Edit student name/email/phone
studentRouter.delete("/:id", deleteStudent);  // Check-out student → free their bed
