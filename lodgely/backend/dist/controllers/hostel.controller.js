"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Controller (controllers/hostel.controller.ts)
//
// Contains the actual business logic for each hostel API endpoint.
// Each function here is called by hostel.routes.ts when a
// matching HTTP request arrives.
//
// Database interactions are done through `prisma` — our ORM
// that converts TypeScript method calls into SQL queries.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHostel = exports.updateHostel = exports.createHostel = exports.getHostelById = exports.getAllHostels = void 0;
const prisma_1 = require("../lib/prisma"); // Prisma DB client
const errorHandler_1 = require("../middleware/errorHandler"); // Our custom error class
// ── GET /api/hostels ─────────────────────────────────────────
// Returns a list of ALL hostels, each including a count of
// how many rooms that hostel has (useful for the card display).
const getAllHostels = async (_req, res) => {
    // prisma.hostel.findMany() = SELECT * FROM hostels
    // `include: { _count: { select: { rooms: true } } }` adds the room count
    // `orderBy: { createdAt: "desc" }` = newest hostels first
    const hostels = await prisma_1.prisma.hostel.findMany({
        include: {
            _count: { select: { rooms: true } }, // Add _count.rooms to each hostel
        },
        orderBy: { createdAt: "desc" },
    });
    // Send a successful JSON response with the hostel array
    res.json({ success: true, data: hostels });
};
exports.getAllHostels = getAllHostels;
// ── GET /api/hostels/:id ─────────────────────────────────────
// Returns ONE hostel by its ID, along with all its rooms.
// Each room also gets a count of how many students are in it.
const getHostelById = async (req, res) => {
    // req.params.id is the `:id` part of the URL (e.g. /api/hostels/abc-123)
    const id = req.params.id;
    const hostel = await prisma_1.prisma.hostel.findUnique({
        where: { id },
        include: {
            rooms: {
                include: { _count: { select: { students: true } } }, // Count students per room
                orderBy: { roomNumber: "asc" }, // Sort rooms by number
            },
        },
    });
    // If no hostel found with that ID, throw a 404 error
    if (!hostel) {
        throw new errorHandler_1.AppError("Hostel not found", 404);
    }
    res.json({ success: true, data: hostel });
};
exports.getHostelById = getHostelById;
// ── POST /api/hostels ─────────────────────────────────────────
// Creates a brand-new hostel in the database.
// Requires: name, totalFloors, address in the request body.
const createHostel = async (req, res) => {
    // Destructure the fields we need from the request body (JSON)
    const { name, totalFloors, address } = req.body;
    // Validate: all three fields are required
    if (!name || !totalFloors || !address) {
        throw new errorHandler_1.AppError("Missing required fields: name, totalFloors, address", 400);
    }
    // Check if a hostel with this name already exists (names must be unique)
    const existing = await prisma_1.prisma.hostel.findUnique({ where: { name } });
    if (existing) {
        throw new errorHandler_1.AppError(`Hostel with name "${name}" already exists`, 409);
    }
    // Actually create the record in the database
    const hostel = await prisma_1.prisma.hostel.create({
        data: { name, totalFloors, address },
    });
    // 201 Created = success, new resource was created
    res.status(201).json({ success: true, data: hostel });
};
exports.createHostel = createHostel;
// ── PUT /api/hostels/:id ──────────────────────────────────────
// Updates an existing hostel's details.
// Only the fields provided in the request body are changed
// (partial update using spread syntax).
const updateHostel = async (req, res) => {
    const id = req.params.id;
    const { name, totalFloors, address } = req.body;
    // `...(name && { name })` means: only include `name` in the update
    // if it was actually sent in the request body (skip undefined fields)
    const hostel = await prisma_1.prisma.hostel.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(totalFloors && { totalFloors }),
            ...(address && { address }),
        },
    });
    res.json({ success: true, data: hostel });
};
exports.updateHostel = updateHostel;
// ── DELETE /api/hostels/:id ───────────────────────────────────
// Deletes a hostel from the database.
// Because of `onDelete: Cascade` in the Prisma schema, deleting
// a hostel automatically deletes all its rooms and students too.
const deleteHostel = async (req, res) => {
    const id = req.params.id;
    // Delete the hostel — Prisma's cascade will handle rooms/students
    await prisma_1.prisma.hostel.delete({ where: { id } });
    res.json({ success: true, message: "Hostel deleted successfully" });
};
exports.deleteHostel = deleteHostel;
//# sourceMappingURL=hostel.controller.js.map