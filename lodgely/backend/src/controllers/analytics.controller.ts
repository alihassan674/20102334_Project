// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Controller
// Dashboard aggregation & revenue intelligence
// ─────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/** GET /api/analytics/dashboard — Master dashboard metrics */
export const getDashboardAnalytics = async (_req: Request, res: Response): Promise<void> => {
  // ── Run all aggregation queries in parallel ──────────────
  const [
    totalHostels,
    totalRooms,
    rooms,
    totalStudents,
    recentCheckIns,
    roomsByStatus,
    roomsByType,
  ] = await Promise.all([
    prisma.hostel.count(),
    prisma.room.count(),
    prisma.room.findMany({ select: { capacity: true, status: true, pricePerMonth: true, _count: { select: { students: true } } } }),
    prisma.student.count(),
    prisma.student.findMany({
      take: 10,
      orderBy: { checkInDate: "desc" },
      include: {
        room: {
          select: {
            roomNumber: true,
            floor: true,
            type: true,
            hostel: { select: { name: true } },
          },
        },
      },
    }),
    prisma.room.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.room.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
  ]);

  // ── Compute metrics ──────────────────────────────────────
  const totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0);
  const occupiedBeds = rooms.reduce((sum: number, r: any) => sum + r._count.students, 0);
  const vacantBeds = totalCapacity - occupiedBeds;
  const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
  const vacancyRate = 100 - occupancyRate;

  // ── Revenue computation ──────────────────────────────────
  // Monthly revenue = sum of pricePerMonth for each occupied bed
  const monthlyRevenue = rooms.reduce((sum: number, r: any) => sum + r._count.students * r.pricePerMonth, 0);

  // Revenue breakdown by month (simulated from check-in dates over the last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const studentsLast6Months = await prisma.student.findMany({
    where: { checkInDate: { gte: sixMonthsAgo } },
    select: {
      checkInDate: true,
      room: { select: { pricePerMonth: true } },
    },
  });

  const revenueByMonth: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    revenueByMonth[key] = 0;
  }

  for (const s of studentsLast6Months) {
    const d = new Date(s.checkInDate);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (key in revenueByMonth) {
      revenueByMonth[key] += s.room.pricePerMonth;
    }
  }

  const monthlyRevenueBreakdown = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue),
  }));

  // ── Available rooms (rooms with at least 1 vacant bed) ──
  const availableRooms = rooms.filter((r: any) => r._count.students < r.capacity && r.status !== "MAINTENANCE").length;

  // ── Status distribution ──────────────────────────────────
  const statusDistribution = roomsByStatus.map((s: any) => ({
    status: s.status,
    count: s._count._all,
  }));

  const typeDistribution = roomsByType.map((t: any) => ({
    type: t.type,
    count: t._count._all,
  }));

  // ── Response ─────────────────────────────────────────────
  res.json({
    success: true,
    data: {
      overview: {
        totalHostels,
        totalRooms,
        totalCapacity,
        occupiedBeds,
        vacantBeds,
        occupancyRate,
        vacancyRate,
        activeResidents: totalStudents,
        availableRooms,
        monthlyRevenue: Math.round(monthlyRevenue),
      },
      monthlyRevenueBreakdown,
      statusDistribution,
      typeDistribution,
      recentCheckIns: recentCheckIns.map((s: any) => ({
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        email: s.email,
        checkInDate: s.checkInDate,
        room: {
          roomNumber: s.room.roomNumber,
          floor: s.room.floor,
          type: s.room.type,
          hostelName: s.room.hostel.name,
        },
      })),
    },
  });
};
