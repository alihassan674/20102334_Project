// ─────────────────────────────────────────────────────────────
// Lodgely — Student Controller
// Handles registration with automatic room assignment
// ─────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/** GET /api/students — List all students with room/hostel info */
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  const { hostelId, roomId, search } = req.query;

  const where: Record<string, unknown> = {};
  if (roomId) where.roomId = roomId as string;
  if (hostelId) where.room = { hostelId: hostelId as string };
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { email: { contains: search as string, mode: "insensitive" } },
      { rollNumber: { contains: search as string, mode: "insensitive" } },
    ];
  }

  const students = await prisma.student.findMany({
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

/** GET /api/students/:id — Get single student */
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      room: {
        include: { hostel: true },
      },
    },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  res.json({ success: true, data: student });
};

/** POST /api/students — Register student + auto-assign to room */
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, email, rollNumber, phone, roomId, checkInDate } = req.body;

  // ── Validate required fields ─────────────────────────────
  if (!name || !email || !rollNumber || !phone || !roomId) {
    throw new AppError("Missing required fields: name, email, rollNumber, phone, roomId", 400);
  }

  // ── Check for duplicate email or roll number ─────────────
  const existingStudent = await prisma.student.findFirst({
    where: { OR: [{ email }, { rollNumber }] },
  });
  if (existingStudent) {
    const field = existingStudent.email === email ? "email" : "roll number";
    throw new AppError(`A student with this ${field} already exists`, 409);
  }

  // ── Verify room exists and has capacity ──────────────────
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { _count: { select: { students: true } } },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (room.status === "MAINTENANCE") {
    throw new AppError("This room is currently under maintenance", 400);
  }

  const currentOccupants = room._count.students;
  if (currentOccupants >= room.capacity) {
    throw new AppError("This room is at full capacity", 400);
  }

  // ── Create student and update room status in a transaction
  const student = await prisma.$transaction(async (tx: any) => {
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

/** PUT /api/students/:id — Update student info */
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, email, phone } = req.body;

  const student = await prisma.student.update({
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

/** DELETE /api/students/:id — Remove student (check-out) */
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  await prisma.$transaction(async (tx: any) => {
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
