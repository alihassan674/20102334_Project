"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Student Controller
// Handles registration with automatic room assignment
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
/** GET /api/students — List all students with room/hostel info */
const getAllStudents = async (req, res) => {
    const { hostelId, roomId, search } = req.query;
    const where = {};
    if (roomId)
        where.roomId = roomId;
    if (hostelId)
        where.room = { hostelId: hostelId };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { rollNumber: { contains: search, mode: "insensitive" } },
        ];
    }
    const students = await prisma_1.prisma.student.findMany({
        where,
        include: {
            room: {
                select: {
                    id: true,
                    roomNumber: true,
                    floor: true,
                    type: true,
                    hostel: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { checkInDate: "desc" },
    });
    res.json({ success: true, data: students, count: students.length });
};
exports.getAllStudents = getAllStudents;
/** GET /api/students/:id — Get single student */
const getStudentById = async (req, res) => {
    const id = req.params.id;
    const student = await prisma_1.prisma.student.findUnique({
        where: { id },
        include: {
            room: {
                include: { hostel: true },
            },
        },
    });
    if (!student) {
        throw new errorHandler_1.AppError("Student not found", 404);
    }
    res.json({ success: true, data: student });
};
exports.getStudentById = getStudentById;
/** POST /api/students — Register student + auto-assign to room */
const createStudent = async (req, res) => {
    const { name, email, rollNumber, phone, roomId, checkInDate } = req.body;
    // ── Validate required fields ─────────────────────────────
    if (!name || !email || !rollNumber || !phone || !roomId) {
        throw new errorHandler_1.AppError("Missing required fields: name, email, rollNumber, phone, roomId", 400);
    }
    // ── Check for duplicate email or roll number ─────────────
    const existingStudent = await prisma_1.prisma.student.findFirst({
        where: { OR: [{ email }, { rollNumber }] },
    });
    if (existingStudent) {
        const field = existingStudent.email === email ? "email" : "roll number";
        throw new errorHandler_1.AppError(`A student with this ${field} already exists`, 409);
    }
    // ── Verify room exists and has capacity ──────────────────
    const room = await prisma_1.prisma.room.findUnique({
        where: { id: roomId },
        include: { _count: { select: { students: true } } },
    });
    if (!room) {
        throw new errorHandler_1.AppError("Room not found", 404);
    }
    if (room.status === "MAINTENANCE") {
        throw new errorHandler_1.AppError("This room is currently under maintenance", 400);
    }
    const currentOccupants = room._count.students;
    if (currentOccupants >= room.capacity) {
        throw new errorHandler_1.AppError("This room is at full capacity", 400);
    }
    // ── Create student and update room status in a transaction
    const student = await prisma_1.prisma.$transaction(async (tx) => {
        const newStudent = await tx.student.create({
            data: {
                name,
                email,
                rollNumber,
                phone,
                roomId,
                checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
            },
            include: {
                room: {
                    select: {
                        id: true,
                        roomNumber: true,
                        floor: true,
                        type: true,
                        hostel: { select: { id: true, name: true } },
                    },
                },
            },
        });
        // Update room status: if room is now full, mark it OCCUPIED
        const newOccupantCount = currentOccupants + 1;
        const newStatus = newOccupantCount >= room.capacity ? "OCCUPIED" : "AVAILABLE";
        await tx.room.update({
            where: { id: roomId },
            data: {
                occupants: newOccupantCount,
                status: newStatus,
            },
        });
        return newStudent;
    });
    res.status(201).json({ success: true, data: student });
};
exports.createStudent = createStudent;
/** PUT /api/students/:id — Update student info */
const updateStudent = async (req, res) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    const student = await prisma_1.prisma.student.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone }),
        },
        include: {
            room: {
                select: {
                    id: true,
                    roomNumber: true,
                    hostel: { select: { id: true, name: true } },
                },
            },
        },
    });
    res.json({ success: true, data: student });
};
exports.updateStudent = updateStudent;
/** DELETE /api/students/:id — Remove student (check-out) */
const deleteStudent = async (req, res) => {
    const id = req.params.id;
    const student = await prisma_1.prisma.student.findUnique({ where: { id } });
    if (!student) {
        throw new errorHandler_1.AppError("Student not found", 404);
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.student.delete({ where: { id } });
        // Recalculate room occupancy
        const remainingStudents = await tx.student.count({
            where: { roomId: student.roomId },
        });
        const room = await tx.room.findUnique({ where: { id: student.roomId } });
        if (room) {
            await tx.room.update({
                where: { id: student.roomId },
                data: {
                    occupants: remainingStudents,
                    status: remainingStudents === 0 ? "AVAILABLE" : remainingStudents < room.capacity ? "AVAILABLE" : "OCCUPIED",
                },
            });
        }
    });
    res.json({ success: true, message: "Student checked out successfully" });
};
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=student.controller.js.map