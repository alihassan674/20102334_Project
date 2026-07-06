"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Room Controller
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getRoomById = exports.getAllRooms = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
/** GET /api/rooms — List rooms with optional filters */
const getAllRooms = async (req, res) => {
    const { status, hostelId, type, floor } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (hostelId)
        where.hostelId = hostelId;
    if (type)
        where.type = type;
    if (floor)
        where.floor = parseInt(floor, 10);
    const rooms = await prisma_1.prisma.room.findMany({
        where,
        include: {
            hostel: { select: { id: true, name: true } },
            _count: { select: { students: true } },
        },
        orderBy: [{ hostelId: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
    });
    // Enrich each room with computed occupancy info
    const enrichedRooms = rooms.map((room) => ({
        ...room,
        currentOccupants: room._count.students,
        availableBeds: room.capacity - room._count.students,
        occupancyPercentage: Math.round((room._count.students / room.capacity) * 100),
    }));
    res.json({ success: true, data: enrichedRooms, count: enrichedRooms.length });
};
exports.getAllRooms = getAllRooms;
/** GET /api/rooms/:id — Get single room with students */
const getRoomById = async (req, res) => {
    const id = req.params.id;
    const room = await prisma_1.prisma.room.findUnique({
        where: { id },
        include: {
            hostel: true,
            students: { orderBy: { checkInDate: "desc" } },
        },
    });
    if (!room) {
        throw new errorHandler_1.AppError("Room not found", 404);
    }
    res.json({
        success: true,
        data: {
            ...room,
            currentOccupants: room.students.length,
            availableBeds: room.capacity - room.students.length,
        },
    });
};
exports.getRoomById = getRoomById;
/** POST /api/rooms — Create a new room */
const createRoom = async (req, res) => {
    const { roomNumber, floor, capacity, type, pricePerMonth, hostelId } = req.body;
    if (!roomNumber || floor === undefined || !capacity || !pricePerMonth || !hostelId) {
        throw new errorHandler_1.AppError("Missing required fields: roomNumber, floor, capacity, pricePerMonth, hostelId", 400);
    }
    // Verify hostel exists
    const hostel = await prisma_1.prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) {
        throw new errorHandler_1.AppError("Hostel not found", 404);
    }
    // Validate floor is within hostel range
    if (floor < 1 || floor > hostel.totalFloors) {
        throw new errorHandler_1.AppError(`Floor must be between 1 and ${hostel.totalFloors}`, 400);
    }
    // Check for duplicate room number in the same hostel
    const existing = await prisma_1.prisma.room.findUnique({
        where: { roomNumber_hostelId: { roomNumber, hostelId } },
    });
    if (existing) {
        throw new errorHandler_1.AppError(`Room "${roomNumber}" already exists in this hostel`, 409);
    }
    const room = await prisma_1.prisma.room.create({
        data: {
            roomNumber,
            floor,
            capacity,
            type: type || "SINGLE",
            pricePerMonth,
            status: "AVAILABLE",
            hostelId,
        },
        include: { hostel: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: room });
};
exports.createRoom = createRoom;
/** PUT /api/rooms/:id — Update room details */
const updateRoom = async (req, res) => {
    const id = req.params.id;
    const { roomNumber, floor, capacity, type, pricePerMonth, status } = req.body;
    const room = await prisma_1.prisma.room.update({
        where: { id },
        data: {
            ...(roomNumber && { roomNumber }),
            ...(floor !== undefined && { floor }),
            ...(capacity !== undefined && { capacity }),
            ...(type && { type }),
            ...(pricePerMonth !== undefined && { pricePerMonth }),
            ...(status && { status }),
        },
        include: { hostel: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: room });
};
exports.updateRoom = updateRoom;
/** DELETE /api/rooms/:id — Delete room */
const deleteRoom = async (req, res) => {
    const id = req.params.id;
    const room = await prisma_1.prisma.room.findUnique({
        where: { id },
        include: { _count: { select: { students: true } } },
    });
    if (!room) {
        throw new errorHandler_1.AppError("Room not found", 404);
    }
    if (room._count.students > 0) {
        throw new errorHandler_1.AppError("Cannot delete a room with active residents. Reassign students first.", 400);
    }
    await prisma_1.prisma.room.delete({ where: { id } });
    res.json({ success: true, message: "Room deleted successfully" });
};
exports.deleteRoom = deleteRoom;
//# sourceMappingURL=room.controller.js.map