"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Room Routes
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
exports.roomRouter = (0, express_1.Router)();
exports.roomRouter.get("/", room_controller_1.getAllRooms);
exports.roomRouter.get("/:id", room_controller_1.getRoomById);
exports.roomRouter.post("/", room_controller_1.createRoom);
exports.roomRouter.put("/:id", room_controller_1.updateRoom);
exports.roomRouter.delete("/:id", room_controller_1.deleteRoom);
//# sourceMappingURL=room.routes.js.map