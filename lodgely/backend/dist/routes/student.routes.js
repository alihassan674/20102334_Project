"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
// Import student controller functions
const student_controller_1 = require("../controllers/student.controller");
// Create the router for student-related endpoints
exports.studentRouter = (0, express_1.Router)();
// ── Route Definitions ─────────────────────────────────────────
exports.studentRouter.get("/", student_controller_1.getAllStudents); // List all students (filterable)
exports.studentRouter.get("/:id", student_controller_1.getStudentById); // Get one student by UUID
exports.studentRouter.post("/", student_controller_1.createStudent); // Register student + auto-update room status
exports.studentRouter.put("/:id", student_controller_1.updateStudent); // Edit student name/email/phone
exports.studentRouter.delete("/:id", student_controller_1.deleteStudent); // Check-out student → free their bed
//# sourceMappingURL=student.routes.js.map