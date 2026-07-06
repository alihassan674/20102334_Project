// ─────────────────────────────────────────────────────────────
// Lodgely — Database Seed Script
// Populates the database with demo hostels, rooms, and students
// ─────────────────────────────────────────────────────────────

import { PrismaClient, RoomType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Clean existing data ──────────────────────────────────
  await prisma.student.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();

  // ── Create Hostels ───────────────────────────────────────
  const hostelA = await prisma.hostel.create({
    data: {
      name: "Azura Hall",
      totalFloors: 4,
      address: "12 University Road, Block A",
    },
  });

  const hostelB = await prisma.hostel.create({
    data: {
      name: "Meridian Tower",
      totalFloors: 6,
      address: "45 Campus Drive, Block C",
    },
  });

  const hostelC = await prisma.hostel.create({
    data: {
      name: "Nova Residency",
      totalFloors: 3,
      address: "78 Scholar Lane, Block D",
    },
  });

  console.log(`  ✅ Created ${3} hostels`);

  // ── Create Rooms ─────────────────────────────────────────
  const roomConfigs: Array<{
    hostelId: string;
    hostelPrefix: string;
    floors: number;
    roomsPerFloor: number;
  }> = [
    { hostelId: hostelA.id, hostelPrefix: "A", floors: 4, roomsPerFloor: 5 },
    { hostelId: hostelB.id, hostelPrefix: "M", floors: 6, roomsPerFloor: 4 },
    { hostelId: hostelC.id, hostelPrefix: "N", floors: 3, roomsPerFloor: 6 },
  ];

  const types: RoomType[] = ["SINGLE", "DOUBLE", "TRIPLE"];
  const prices: Record<RoomType, number> = { SINGLE: 5000, DOUBLE: 3500, TRIPLE: 2500 };
  const capacities: Record<RoomType, number> = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3 };

  const allRooms: Array<{ id: string; capacity: number }> = [];

  for (const config of roomConfigs) {
    for (let floor = 1; floor <= config.floors; floor++) {
      for (let r = 1; r <= config.roomsPerFloor; r++) {
        const type = types[(floor + r) % 3];
        const roomNumber = `${config.hostelPrefix}${floor}${String(r).padStart(2, "0")}`;

        const room = await prisma.room.create({
          data: {
            roomNumber,
            floor,
            capacity: capacities[type],
            type,
            pricePerMonth: prices[type],
            status: "AVAILABLE",
            hostelId: config.hostelId,
          },
        });

        allRooms.push({ id: room.id, capacity: room.capacity });
      }
    }
  }

  console.log(`  ✅ Created ${allRooms.length} rooms`);

  // ── Create Students (fill ~60% of rooms) ─────────────────
  const firstNames = [
    "Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Arjun", "Diya",
    "Karan", "Meera", "Nikhil", "Pooja", "Rahul", "Sanya", "Tarun", "Uma",
    "Varun", "Wafa", "Yash", "Zara", "Aditi", "Bhavesh", "Chitra", "Dev",
    "Esha", "Farhan", "Gauri", "Hassan", "Isha", "Jai", "Kavya", "Lakshay",
  ];

  const lastNames = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Khan", "Reddy", "Nair",
    "Verma", "Joshi", "Bhat", "Das", "Malik", "Rao", "Kapoor", "Agarwal",
  ];

  let studentCount = 0;
  const roomsToFill = allRooms.slice(0, Math.floor(allRooms.length * 0.6));

  for (const room of roomsToFill) {
    const studentsForRoom = Math.ceil(room.capacity * 0.7) || 1;

    for (let s = 0; s < studentsForRoom; s++) {
      const firstName = firstNames[(studentCount + s) % firstNames.length];
      const lastName = lastNames[(studentCount + s * 3) % lastNames.length];
      const name = `${firstName} ${lastName}`;

      // Generate a check-in date within the last 6 months
      const daysAgo = Math.floor(Math.random() * 180);
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() - daysAgo);

      await prisma.student.create({
        data: {
          name,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCount}@university.edu`,
          rollNumber: `2024${String(studentCount + 1).padStart(4, "0")}`,
          phone: `+91 ${9000000000 + studentCount}`,
          checkInDate,
          roomId: room.id,
        },
      });

      studentCount++;
    }

    // Update room occupancy
    const actualOccupants = await prisma.student.count({ where: { roomId: room.id } });
    await prisma.room.update({
      where: { id: room.id },
      data: {
        occupants: actualOccupants,
        status: actualOccupants >= room.capacity ? "OCCUPIED" : "AVAILABLE",
      },
    });
  }

  // Mark a few rooms as maintenance
  const maintenanceRooms = allRooms.slice(-3);
  for (const r of maintenanceRooms) {
    await prisma.room.update({
      where: { id: r.id },
      data: { status: "MAINTENANCE" },
    });
  }

  console.log(`  ✅ Created ${studentCount} students`);
  console.log(`  ✅ Marked ${maintenanceRooms.length} rooms as maintenance\n`);
  console.log("🎉 Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
