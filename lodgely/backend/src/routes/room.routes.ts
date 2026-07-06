// ─────────────────────────────────────────────────────────────
// Lodgely — Room Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller";

export const roomRouter = Router();

roomRouter.get("/", getAllRooms);
roomRouter.get("/:id", getRoomById);
roomRouter.post("/", createRoom);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);
