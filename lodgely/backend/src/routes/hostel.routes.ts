// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from "../controllers/hostel.controller";

export const hostelRouter = Router();

hostelRouter.get("/", getAllHostels);
hostelRouter.get("/:id", getHostelById);
hostelRouter.post("/", createHostel);
hostelRouter.put("/:id", updateHostel);
hostelRouter.delete("/:id", deleteHostel);
