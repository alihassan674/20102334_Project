"use strict";
// ─────────────────────────────────────────────────────────────
// Lodgely — Analytics Controller (controllers/analytics.controller.ts)
//
// This single endpoint powers the entire dashboard page.
// It aggregates data from all three tables (Hostel, Room, Student)
// and returns a single JSON response with:
//   - Overview statistics (totals, occupancy rate, revenue)
//   - Monthly revenue breakdown (last 6 months chart data)
//   - Room status distribution (AVAILABLE / OCCUPIED / MAINTENANCE)
//   - Room type distribution (SINGLE / DOUBLE / TRIPLE)
//   - Recent check-ins list
//
// WHY Promise.all()?
// Instead of running 7 database queries one after another (slow),
// we run them all AT THE SAME TIME in parallel using Promise.all().
// The response is only sent once ALL queries have finished.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const prisma_1 = require("../lib/prisma");
// ── GET /api/analytics/dashboard ─────────────────────────────
const getDashboardAnalytics = async (_req, res) => {
    // ── Step 1: Run all database queries in PARALLEL ──────────
    // Each element in the array is one Prisma query.
    // They all start at the same time and we wait for all of them.
    const [totalHostels, // Total number of hostel records
    totalRooms, // Total number of room records
    rooms, // All rooms with capacity, status, price, and student count
    totalStudents, // Total number of registered students
    recentCheckIns, // The 10 most recently checked-in students
    roomsByStatus, // Count of rooms grouped by status (AVAILABLE/OCCUPIED/MAINTENANCE)
    roomsByType, // Count of rooms grouped by type (SINGLE/DOUBLE/TRIPLE)
    ] = await Promise.all([
        prisma_1.prisma.hostel.count(), // Simple count query
        prisma_1.prisma.room.count(), // Simple count query
        // Get all rooms with just the fields we need for calculations
        prisma_1.prisma.room.findMany({
            select: {
                capacity: true,
                status: true,
                pricePerMonth: true,
                _count: { select: { students: true } }, // How many students are in each room
            },
        }),
        prisma_1.prisma.student.count(), // Simple count query
        // Get the 10 most recently checked-in students with room + hostel details
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
        // Group rooms by their status and count each group
        // Result: [{ status: "AVAILABLE", _count: { _all: 5 } }, ...]
        prisma_1.prisma.room.groupBy({
            by: ["status"],
            _count: { _all: true },
        }),
        // Group rooms by their type and count each group
        // Result: [{ type: "SINGLE", _count: { _all: 10 } }, ...]
        prisma_1.prisma.room.groupBy({
            by: ["type"],
            _count: { _all: true },
        }),
    ]);
    // ── Step 2: Compute derived metrics from raw data ─────────
    // Total beds = sum of all room capacities
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    // Occupied beds = sum of actual students across all rooms
    const occupiedBeds = rooms.reduce((sum, r) => sum + r._count.students, 0);
    const vacantBeds = totalCapacity - occupiedBeds;
    // Occupancy rate as a percentage (e.g. 75 means 75% full)
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
    const vacancyRate = 100 - occupancyRate;
    // Monthly revenue = price-per-month for each OCCUPIED bed
    // (i.e. we charge per student, not per room)
    const monthlyRevenue = rooms.reduce((sum, r) => sum + r._count.students * r.pricePerMonth, 0);
    // ── Step 3: Build monthly revenue chart data (last 6 months) ──
    // This builds a bar chart dataset like:
    //   [{ month: "Jan 2026", revenue: 45000 }, { month: "Feb 2026", revenue: 52000 }, ...]
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    // Get all students who checked in during the last 6 months
    const studentsLast6Months = await prisma_1.prisma.student.findMany({
        where: { checkInDate: { gte: sixMonthsAgo } },
        select: {
            checkInDate: true,
            room: { select: { pricePerMonth: true } }, // We need the price they pay
        },
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Initialize a dictionary for the last 6 months with 0 revenue each
    const revenueByMonth = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`; // e.g. "Jan 2026"
        revenueByMonth[key] = 0;
    }
    // Add each student's room price to their check-in month's revenue total
    for (const s of studentsLast6Months) {
        const d = new Date(s.checkInDate);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (key in revenueByMonth) {
            revenueByMonth[key] += s.room.pricePerMonth;
        }
    }
    // Convert the dictionary to an array for the chart component
    const monthlyRevenueBreakdown = Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
    }));
    // ── Step 4: Count rooms that still have free beds ─────────
    const availableRooms = rooms.filter((r) => r._count.students < r.capacity && r.status !== "MAINTENANCE").length;
    // ── Step 5: Format the groupBy results into clean arrays ──
    const statusDistribution = roomsByStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
    }));
    const typeDistribution = roomsByType.map((t) => ({
        type: t.type,
        count: t._count._all,
    }));
    // ── Step 6: Send the full analytics response ──────────────
    res.json({
        success: true,
        data: {
            // Overview stats cards on the dashboard
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
            monthlyRevenueBreakdown, // For the bar chart
            statusDistribution, // For the status pie/bar chart
            typeDistribution, // For the type breakdown chart
            // Recent check-ins table
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