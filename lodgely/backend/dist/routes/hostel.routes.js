"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Routes
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostelRouter = void 0;
const express_1 = require("express");
const hostel_controller_1 = require("../controllers/hostel.controller");
exports.hostelRouter = (0, express_1.Router)();
exports.hostelRouter.get("/", hostel_controller_1.getAllHostels);
exports.hostelRouter.get("/:id", hostel_controller_1.getHostelById);
exports.hostelRouter.post("/", hostel_controller_1.createHostel);
exports.hostelRouter.put("/:id", hostel_controller_1.updateHostel);
exports.hostelRouter.delete("/:id", hostel_controller_1.deleteHostel);
//# sourceMappingURL=hostel.routes.js.map