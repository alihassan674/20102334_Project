"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Room Controller (controllers/room.controller.ts)
//
// Contains the business logic for all room-related API endpoints.
// A Room always belongs to a Hostel (via hostelId foreign key).
//
// Key concepts handled here:
//   - Filtering rooms by hostel, status, type, or floor
//   - Occupancy calculation (available beds = capacity - occupants)
//   - Validation: floor must be within hostel range
//   - Preventing deletion when students are still assigned
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getRoomById = exports.getAllRooms = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
// ── GET /api/rooms ───────────────────────────────────────────
// Returns all rooms, with optional query parameter filters.
// Example: GET /api/rooms?hostelId=abc&status=AVAILABLE
const getAllRooms = async (req, res) => {
    // Read optional filter values from the URL query string
    const { status, hostelId, type, floor } = req.query;
    // Build a dynamic `where` filter object for Prisma
    // Only add a filter if the query param was actually provided
    const where = {};
    if (status)
        where.status = status;
    if (hostelId)
        where.hostelId = hostelId;
    if (type)
        where.type = type;
    if (floor)
        where.floor = parseInt(floor, 10); // Convert string to number
    // Query the database for matching rooms
    const rooms = await prisma_1.prisma.room.findMany({
        where,
        include: {
            hostel: { select: { id: true, name: true } }, // Include hostel name for display
            _count: { select: { students: true } }, // Count how many students are in each room
        },
        orderBy: [{ hostelId: "asc" }, { floor: "asc" }, { roomNumber: "asc" }], // Sort logically
    });
    // Add computed fields to each room so the frontend doesn't have to calculate them
    const enrichedRooms = rooms.map((room) => ({
        ...room,
        currentOccupants: room._count.students, // How many students are currently in
        availableBeds: room.capacity - room._count.students, // How many free beds remain
        occupancyPercentage: Math.round((room._count.students / room.capacity) * 100), // e.g. 75%
    }));
    res.json({ success: true, data: enrichedRooms, count: enrichedRooms.length });
};
exports.getAllRooms = getAllRooms;
// ── GET /api/rooms/:id ───────────────────────────────────────
// Returns a single room by ID, including the full list of students inside it.
const getRoomById = async (req, res) => {
    const id = req.params.id;
    const room = await prisma_1.prisma.room.findUnique({
        where: { id },
        include: {
            hostel: true, // Full hostel details
            students: { orderBy: { checkInDate: "desc" } }, // Students sorted newest first
        },
    });
    // 404 if no room with this ID exists
    if (!room) {
        throw new errorHandler_1.AppError("Room not found", 404);
    }
    res.json({
        success: true,
        data: {
            ...room,
            currentOccupants: room.students.length, // Live count
            availableBeds: room.capacity - room.students.length, // Remaining beds
        },
    });
};
exports.getRoomById = getRoomById;
// ── POST /api/rooms ──────────────────────────────────────────
// Creates a new room inside an existing hostel.
// Validates: the hostel exists, floor is within range, no duplicate room number.
const createRoom = async (req, res) => {
    const { roomNumber, floor, capacity, type, pricePerMonth, hostelId } = req.body;
    // All these fields are required to create a room
    if (!roomNumber || floor === undefined || !capacity || !pricePerMonth || !hostelId) {
        throw new errorHandler_1.AppError("Missing required fields: roomNumber, floor, capacity, pricePerMonth, hostelId", 400);
    }
    // ── Validate the hostel exists ───────────────────────────
    const hostel = await prisma_1.prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) {
        throw new errorHandler_1.AppError("Hostel not found", 404);
    }
    // ── Validate the floor number is within the hostel's range ──
    // e.g. a 3-floor hostel cannot have a room on floor 5
    if (floor < 1 || floor > hostel.totalFloors) {
        throw new errorHandler_1.AppError(`Floor must be between 1 and ${hostel.totalFloors}`, 400);
    }
    // ── Check for duplicate room number within the same hostel ──
    // Each hostel can only have one room with a given number (e.g. "101")
    const existing = await prisma_1.prisma.room.findUnique({
        where: { roomNumber_hostelId: { roomNumber, hostelId } }, // Composite unique key
    });
    if (existing) {
        throw new errorHandler_1.AppError(`Room "${roomNumber}" already exists in this hostel`, 409);
    }
    // ── Create the room in the database ─────────────────────
    const room = await prisma_1.prisma.room.create({
        data: {
            roomNumber,
            floor,
            capacity,
            type: type || "SINGLE", // Default to SINGLE if not specified
            pricePerMonth,
            status: "AVAILABLE", // New rooms start as available
            hostelId,
        },
        include: { hostel: { select: { id: true, name: true } } }, // Return hostel info too
    });
    res.status(201).json({ success: true, data: room });
};
exports.createRoom = createRoom;
// ── PUT /api/rooms/:id ───────────────────────────────────────
// Updates an existing room's details.
// Only the fields sent in the request body are changed.
const updateRoom = async (req, res) => {
    const id = req.params.id;
    const { roomNumber, floor, capacity, type, pricePerMonth, status } = req.body;
    // Partial update — only include fields that were provided
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
// ── DELETE /api/rooms/:id ────────────────────────────────────
// Deletes a room — BUT only if it has no students currently assigned.
// This prevents accidentally losing student records.
const deleteRoom = async (req, res) => {
    const id = req.params.id;
    // First, check if the room exists and how many students are in it
    const room = await prisma_1.prisma.room.findUnique({
        where: { id },
        include: { _count: { select: { students: true } } },
    });
    if (!room) {
        throw new errorHandler_1.AppError("Room not found", 404);
    }
    // Refuse deletion if students are still assigned to this room
    if (room._count.students > 0) {
        throw new errorHandler_1.AppError("Cannot delete a room with active residents. Reassign students first.", 400);
    }
    // Safe to delete — no students are affected
    await prisma_1.prisma.room.delete({ where: { id } });
    res.json({ success: true, message: "Room deleted successfully" });
};
exports.deleteRoom = deleteRoom;
//# sourceMappingURL=room.controller.js.map