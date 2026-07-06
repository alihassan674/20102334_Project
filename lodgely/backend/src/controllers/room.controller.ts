// ─────────────────────────────────────────────────────────────
// Lodgely — Room Controller
// ─────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { RoomStatus, RoomType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/** GET /api/rooms — List rooms with optional filters */
export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  const { status, hostelId, type, floor } = req.query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status as RoomStatus;
  if (hostelId) where.hostelId = hostelId as string;
  if (type) where.type = type as RoomType;
  if (floor) where.floor = parseInt(floor as string, 10);

  const rooms = await prisma.room.findMany({
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

/** GET /api/rooms/:id — Get single room with students */
export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      hostel: true,
      students: { orderBy: { checkInDate: "desc" } },
    },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
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

/** POST /api/rooms — Create a new room */
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  const { roomNumber, floor, capacity, type, pricePerMonth, hostelId } = req.body;

  if (!roomNumber || floor === undefined || !capacity || !pricePerMonth || !hostelId) {
    throw new AppError("Missing required fields: roomNumber, floor, capacity, pricePerMonth, hostelId", 400);
  }

  // Verify hostel exists
  const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  // Validate floor is within hostel range
  if (floor < 1 || floor > hostel.totalFloors) {
    throw new AppError(`Floor must be between 1 and ${hostel.totalFloors}`, 400);
  }

  // Check for duplicate room number in the same hostel
  const existing = await prisma.room.findUnique({
    where: { roomNumber_hostelId: { roomNumber, hostelId } },
  });
  if (existing) {
    throw new AppError(`Room "${roomNumber}" already exists in this hostel`, 409);
  }

  const room = await prisma.room.create({
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

/** PUT /api/rooms/:id — Update room details */
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { roomNumber, floor, capacity, type, pricePerMonth, status } = req.body;

  const room = await prisma.room.update({
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

/** DELETE /api/rooms/:id — Delete room */
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const room = await prisma.room.findUnique({
    where: { id },
    include: { _count: { select: { students: true } } },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (room._count.students > 0) {
    throw new AppError("Cannot delete a room with active residents. Reassign students first.", 400);
  }

  await prisma.room.delete({ where: { id } });

  res.json({ success: true, message: "Room deleted successfully" });
};
