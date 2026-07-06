"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Controller
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHostel = exports.updateHostel = exports.createHostel = exports.getHostelById = exports.getAllHostels = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
/** GET /api/hostels — List all hostels with room counts */
const getAllHostels = async (_req, res) => {
    const hostels = await prisma_1.prisma.hostel.findMany({
        include: {
            _count: { select: { rooms: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: hostels });
};
exports.getAllHostels = getAllHostels;
/** GET /api/hostels/:id — Get hostel details with rooms */
const getHostelById = async (req, res) => {
    const id = req.params.id;
    const hostel = await prisma_1.prisma.hostel.findUnique({
        where: { id },
        include: {
            rooms: {
                include: { _count: { select: { students: true } } },
                orderBy: { roomNumber: "asc" },
            },
        },
    });
    if (!hostel) {
        throw new errorHandler_1.AppError("Hostel not found", 404);
    }
    res.json({ success: true, data: hostel });
};
exports.getHostelById = getHostelById;
/** POST /api/hostels — Create a new hostel */
const createHostel = async (req, res) => {
    const { name, totalFloors, address } = req.body;
    if (!name || !totalFloors || !address) {
        throw new errorHandler_1.AppError("Missing required fields: name, totalFloors, address", 400);
    }
    const existing = await prisma_1.prisma.hostel.findUnique({ where: { name } });
    if (existing) {
        throw new errorHandler_1.AppError(`Hostel with name "${name}" already exists`, 409);
    }
    const hostel = await prisma_1.prisma.hostel.create({
        data: { name, totalFloors, address },
    });
    res.status(201).json({ success: true, data: hostel });
};
exports.createHostel = createHostel;
/** PUT /api/hostels/:id — Update hostel */
const updateHostel = async (req, res) => {
    const id = req.params.id;
    const { name, totalFloors, address } = req.body;
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
/** DELETE /api/hostels/:id — Delete hostel (cascades to rooms/students) */
const deleteHostel = async (req, res) => {
    const id = req.params.id;
    await prisma_1.prisma.hostel.delete({ where: { id } });
    res.json({ success: true, message: "Hostel deleted successfully" });
};
exports.deleteHostel = deleteHostel;
//# sourceMappingURL=hostel.controller.js.map