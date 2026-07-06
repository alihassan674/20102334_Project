"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Student Routes
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
exports.studentRouter = (0, express_1.Router)();
exports.studentRouter.get("/", student_controller_1.getAllStudents);
exports.studentRouter.get("/:id", student_controller_1.getStudentById);
exports.studentRouter.post("/", student_controller_1.createStudent);
exports.studentRouter.put("/:id", student_controller_1.updateStudent);
exports.studentRouter.delete("/:id", student_controller_1.deleteStudent);
//# sourceMappingURL=student.routes.js.map