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

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";           // Prisma DB client
import { AppError } from "../middleware/errorHandler"; // Our custom error class

// ── GET /api/hostels ─────────────────────────────────────────
// Returns a list of ALL hostels, each including a count of
// how many rooms that hostel has (useful for the card display).
export const getAllHostels = async (_req: Request, res: Response): Promise<void> => {
  // prisma.hostel.findMany() = SELECT * FROM hostels
  // `include: { _count: { select: { rooms: true } } }` adds the room count
  // `orderBy: { createdAt: "desc" }` = newest hostels first
  const hostels = await prisma.hostel.findMany({
    include: {
      _count: { select: { rooms: true } }, // Add _count.rooms to each hostel
    },
    orderBy: { createdAt: "desc" },
  });

  // Send a successful JSON response with the hostel array
  res.json({ success: true, data: hostels });
};

// ── GET /api/hostels/:id ─────────────────────────────────────
// Returns ONE hostel by its ID, along with all its rooms.
// Each room also gets a count of how many students are in it.
export const getHostelById = async (req: Request, res: Response): Promise<void> => {
  // req.params.id is the `:id` part of the URL (e.g. /api/hostels/abc-123)
  const id = req.params.id as string;

  const hostel = await prisma.hostel.findUnique({
    where: { id },
    include: {
      rooms: {
        include: { _count: { select: { students: true } } }, // Count students per room
        orderBy: { roomNumber: "asc" },                       // Sort rooms by number
      },
    },
  });

  // If no hostel found with that ID, throw a 404 error
  if (!hostel) {
    throw new AppError("Hostel not found", 404);
  }

  res.json({ success: true, data: hostel });
};

// ── POST /api/hostels ─────────────────────────────────────────
// Creates a brand-new hostel in the database.
// Requires: name, totalFloors, address in the request body.
export const createHostel = async (req: Request, res: Response): Promise<void> => {
  // Destructure the fields we need from the request body (JSON)
  const { name, totalFloors, address } = req.body;

  // Validate: all three fields are required
  if (!name || !totalFloors || !address) {
    throw new AppError("Missing required fields: name, totalFloors, address", 400);
  }

  // Check if a hostel with this name already exists (names must be unique)
  const existing = await prisma.hostel.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(`Hostel with name "${name}" already exists`, 409);
  }

  // Actually create the record in the database
  const hostel = await prisma.hostel.create({
    data: { name, totalFloors, address },
  });

  // 201 Created = success, new resource was created
  res.status(201).json({ success: true, data: hostel });
};

// ── PUT /api/hostels/:id ──────────────────────────────────────
// Updates an existing hostel's details.
// Only the fields provided in the request body are changed
// (partial update using spread syntax).
export const updateHostel = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { name, totalFloors, address } = req.body;

  // `...(name && { name })` means: only include `name` in the update
  // if it was actually sent in the request body (skip undefined fields)
  const hostel = await prisma.hostel.update({
    where: { id },
    data: {
      ...(name        && { name }),
      ...(totalFloors && { totalFloors }),
      ...(address     && { address }),
    },
  });

  res.json({ success: true, data: hostel });
};

// ── DELETE /api/hostels/:id ───────────────────────────────────
// Deletes a hostel from the database.
// Because of `onDelete: Cascade` in the Prisma schema, deleting
// a hostel automatically deletes all its rooms and students too.
export const deleteHostel = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;

  // Delete the hostel — Prisma's cascade will handle rooms/students
  await prisma.hostel.delete({ where: { id } });

  res.json({ success: true, message: "Hostel deleted successfully" });
};
