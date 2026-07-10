// ─────────────────────────────────────────────────────────────
// Lodgely — Student Controller (controllers/student.controller.ts)
//
// Contains the business logic for student registration,
// updates, and check-out.
//
// KEY FEATURE — Database Transactions:
// When a student is registered or checked out, TWO things must
// happen at the same time:
//   1. Create/delete the student record
//   2. Update the room's occupant count + status
//
// We use prisma.$transaction() to wrap both operations so that
// if one fails, the other is rolled back automatically.
// This prevents data inconsistencies (e.g. student created but
// room status not updated).
// ─────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ── GET /api/students ────────────────────────────────────────
// Returns all students, with optional filters.
// Supports: ?hostelId=, ?roomId=, ?search= (name/email/rollNumber)
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  // Read optional filter values from the URL query string
  const { hostelId, roomId, search } = req.query;

  // Build a dynamic filter object
  const where: Record<string, unknown> = {};
  if (roomId)   where.roomId = roomId as string;
  if (hostelId) where.room   = { hostelId: hostelId as string }; // Filter by the room's hostel

  // Search across multiple fields at once using OR logic
  if (search) {
    where.OR = [
      { name:       { contains: search as string, mode: "insensitive" } }, // Name contains search text
      { email:      { contains: search as string, mode: "insensitive" } },
      { rollNumber: { contains: search as string, mode: "insensitive" } },
    ];
  }

  // Fetch students with their room + hostel info for display
  const students = await prisma.student.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          roomNumber: true,
          floor: true,
          type: true,
          hostel: { select: { id: true, name: true } }, // Include hostel name
        },
      },
    },
    orderBy: { checkInDate: "desc" }, // Most recently checked-in first
  });

  res.json({ success: true, data: students, count: students.length });
};

// ── GET /api/students/:id ────────────────────────────────────
// Returns one student by ID with full room + hostel details.
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      room: {
        include: { hostel: true }, // Full hostel object
      },
    },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  res.json({ success: true, data: student });
};

// ── POST /api/students ───────────────────────────────────────
// Registers a new student and assigns them to a room.
// This is the most complex function — it:
//   1. Validates required fields
//   2. Checks for duplicate email or roll number
//   3. Verifies the room exists and has space
//   4. Creates the student AND updates room status in a transaction
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, email, rollNumber, phone, roomId, checkInDate } = req.body;

  // ── Step 1: Validate required fields ─────────────────────
  if (!name || !email || !rollNumber || !phone || !roomId) {
    throw new AppError("Missing required fields: name, email, rollNumber, phone, roomId", 400);
  }

  // ── Step 2: Prevent duplicate email or roll number ───────
  // Two students cannot share the same email or university roll number
  const existingStudent = await prisma.student.findFirst({
    where: { OR: [{ email }, { rollNumber }] },
  });
  if (existingStudent) {
    const field = existingStudent.email === email ? "email" : "roll number";
    throw new AppError(`A student with this ${field} already exists`, 409);
  }

  // ── Step 3: Check room availability ──────────────────────
  // Fetch the room and its current occupant count
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { _count: { select: { students: true } } },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // Rooms under maintenance cannot accept new students
  if (room.status === "MAINTENANCE") {
    throw new AppError("This room is currently under maintenance", 400);
  }

  const currentOccupants = room._count.students;
  // Room is full if current students >= room capacity
  if (currentOccupants >= room.capacity) {
    throw new AppError("This room is at full capacity", 400);
  }

  // ── Step 4: Run both DB operations in a transaction ──────
  // A transaction means: if the student creation fails, the room
  // update is also cancelled (and vice versa). Data stays consistent.
  const student = await prisma.$transaction(async (tx: any) => {
    // Create the student record
    const newStudent = await tx.student.create({
      data: {
        name,
        email,
        rollNumber,
        phone,
        roomId,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(), // Default to today
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

    // Recalculate room status after adding this student
    const newOccupantCount = currentOccupants + 1;
    // If the room is now full, mark it OCCUPIED; otherwise keep AVAILABLE
    const newStatus = newOccupantCount >= room.capacity ? "OCCUPIED" : "AVAILABLE";

    // Update the room's occupant count and status
    await tx.room.update({
      where: { id: roomId },
      data: {
        occupants: newOccupantCount,
        status:    newStatus,
      },
    });

    return newStudent; // Return the newly created student
  });

  res.status(201).json({ success: true, data: student });
};

// ── PUT /api/students/:id ────────────────────────────────────
// Updates a student's personal info (name, email, phone).
// Room assignment cannot be changed via this endpoint.
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, email, phone } = req.body;

  // Partial update — only update fields that were sent
  const student = await prisma.student.update({
    where: { id },
    data: {
      ...(name  && { name }),
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

// ── DELETE /api/students/:id ─────────────────────────────────
// "Check out" a student: removes them from the database and
// updates the room's occupant count and status accordingly.
// Again uses a transaction so both changes succeed or fail together.
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  // First confirm the student exists
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Run deletion + room update as an atomic transaction
  await prisma.$transaction(async (tx: any) => {
    // Step A: Delete the student record
    await tx.student.delete({ where: { id } });

    // Step B: Count how many students are STILL in this room
    const remainingStudents = await tx.student.count({
      where: { roomId: student.roomId },
    });

    // Step C: Update the room's occupancy info
    const room = await tx.room.findUnique({ where: { id: student.roomId } });
    if (room) {
      await tx.room.update({
        where: { id: student.roomId },
        data: {
          occupants: remainingStudents,
          // If nobody left → AVAILABLE, if still under capacity → AVAILABLE, else OCCUPIED
          status: remainingStudents === 0
            ? "AVAILABLE"
            : remainingStudents < room.capacity
              ? "AVAILABLE"
              : "OCCUPIED",
        },
      });
    }
  });

  res.json({ success: true, message: "Student checked out successfully" });
};
