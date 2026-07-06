"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Controller
// Dashboard aggregation & revenue intelligence
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const prisma_1 = require("../lib/prisma");
/** GET /api/analytics/dashboard — Master dashboard metrics */
const getDashboardAnalytics = async (_req, res) => {
    // ── Run all aggregation queries in parallel ──────────────
    const [totalHostels, totalRooms, rooms, totalStudents, recentCheckIns, roomsByStatus, roomsByType,] = await Promise.all([
        prisma_1.prisma.hostel.count(),
        prisma_1.prisma.room.count(),
        prisma_1.prisma.room.findMany({ select: { capacity: true, status: true, pricePerMonth: true, _count: { select: { students: true } } } }),
        prisma_1.prisma.student.count(),
        prisma_1.prisma.student.findMany({
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
        prisma_1.prisma.room.groupBy({
            by: ["status"],
            _count: { _all: true },
        }),
        prisma_1.prisma.room.groupBy({
            by: ["type"],
            _count: { _all: true },
        }),
    ]);
    // ── Compute metrics ──────────────────────────────────────
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + r._count.students, 0);
    const vacantBeds = totalCapacity - occupiedBeds;
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
    const vacancyRate = 100 - occupancyRate;
    // ── Revenue computation ──────────────────────────────────
    // Monthly revenue = sum of pricePerMonth for each occupied bed
    const monthlyRevenue = rooms.reduce((sum, r) => sum + r._count.students * r.pricePerMonth, 0);
    // Revenue breakdown by month (simulated from check-in dates over the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const studentsLast6Months = await prisma_1.prisma.student.findMany({
        where: { checkInDate: { gte: sixMonthsAgo } },
        select: {
            checkInDate: true,
            room: { select: { pricePerMonth: true } },
        },
    });
    const revenueByMonth = {};
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
    const availableRooms = rooms.filter((r) => r._count.students < r.capacity && r.status !== "MAINTENANCE").length;
    // ── Status distribution ──────────────────────────────────
    const statusDistribution = roomsByStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
    }));
    const typeDistribution = roomsByType.map((t) => ({
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
            recentCheckIns: recentCheckIns.map((s) => ({
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
exports.getDashboardAnalytics = getDashboardAnalytics;
//# sourceMappingURL=analytics.controller.js.map