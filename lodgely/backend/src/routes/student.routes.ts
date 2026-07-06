// ─────────────────────────────────────────────────────────────
// Lodgely — Student Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller";

export const studentRouter = Router();

studentRouter.get("/", getAllStudents);
studentRouter.get("/:id", getStudentById);
studentRouter.post("/", createStudent);
studentRouter.put("/:id", updateStudent);
studentRouter.delete("/:id", deleteStudent);
