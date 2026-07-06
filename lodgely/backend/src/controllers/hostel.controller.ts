// ─────────────────────────────────────────────────────────────
// Lodgely — Hostel Controller
// ─────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

/** GET /api/hostels — List all hostels with room counts */
export const getAllHostels = async (_req: Request, res: Response): Promise<void> => {
  const hostels = await prisma.hostel.findMany({
    include: {
      _count: { select: { rooms: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: hostels });
};

/** GET /api/hostels/:id — Get hostel details with rooms */
export const getHostelById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: {
      rooms: {
        include: { _count: { select: { students: true } } },
        orderBy: { roomNumber: "asc" },
      },
    },
  });

  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  res.json({ success: true, data: hostel });
};

/** POST /api/hostels — Create a new hostel */
export const createHostel = async (req: Request, res: Response): Promise<void> => {
  const { name, totalFloors, address } = req.body;

  if (!name || !totalFloors || !address) {
    throw new AppError("Missing required fields: name, totalFloors, address", 400);
  }

  const existing = await prisma.hostel.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(`Hostel with name "${name}" already exists`, 409);
  }

  const hostel = await prisma.hostel.create({
    data: { name, totalFloors, address },
  });

  res.status(201).json({ success: true, data: hostel });
};

/** PUT /api/hostels/:id — Update hostel */
export const updateHostel = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, totalFloors, address } = req.body;

  const hostel = await prisma.hostel.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(totalFloors && { totalFloors }),
      ...(address && { address }),
    },
  });

  res.json({ success: true, data: hostel });
};

/** DELETE /api/hostels/:id — Delete hostel (cascades to rooms/students) */
export const deleteHostel = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  await prisma.hostel.delete({ where: { id } });

  res.json({ success: true, message: "Hostel deleted successfully" });
};
