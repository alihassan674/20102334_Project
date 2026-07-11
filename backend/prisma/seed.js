import { prisma } from "../prisma.js";

async function main() {
    console.log("🌱 Seeding database...");

    // Delete existing records in child-to-parent order to avoid dependency violations
    await prisma.student.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hostel.deleteMany();

    // Create Hostels
    const aliHostel = await prisma.hostel.create({
        data: {
            hostelName: "Ali Hostel",
            hostelFloors: 4,
            hostelAddress: "Faisalabad",
        }
    });

    const iqbalHostel = await prisma.hostel.create({
        data: {
            hostelName: "Iqbal Hostel",
            hostelFloors: 3,
            hostelAddress: "Lahore",
        }
    });

    const jinnahHostel = await prisma.hostel.create({
        data: {
            hostelName: "Jinnah Hostel",
            hostelFloors: 5,
            hostelAddress: "Islamabad",
        }
    });

    // Create Rooms for Ali Hostel
    const aliRoom1 = await prisma.room.create({
        data: {
            roomNumber: "101",
            floorNumber: 1,
            capacity: 4,
            hostelId: aliHostel.id,
        }
    });

    const aliRoom2 = await prisma.room.create({
        data: {
            roomNumber: "102",
            floorNumber: 1,
            capacity: 2,
            hostelId: aliHostel.id,
        }
    });

    // Create Rooms for Iqbal Hostel
    const iqbalRoom1 = await prisma.room.create({
        data: {
            roomNumber: "201",
            floorNumber: 2,
            capacity: 3,
            hostelId: iqbalHostel.id,
        }
    });

    // Create Students
    await prisma.student.create({
        data: {
            firstName: "John",
            lastName: "Doe",
            registrationNo: "REG101",
            department: "Computer Science",
            phone: "+923001234567",
            email: "john.doe@example.com",
            roomId: aliRoom1.id,
        }
    });

    await prisma.student.create({
        data: {
            firstName: "Jane",
            lastName: "Smith",
            registrationNo: "REG102",
            department: "Electrical Engineering",
            phone: "+923007654321",
            email: "jane.smith@example.com",
            roomId: aliRoom1.id,
        }
    });

    await prisma.student.create({
        data: {
            firstName: "Ali",
            lastName: "Hassan",
            registrationNo: "REG103",
            department: "Software Engineering",
            phone: "+923001112222",
            email: "ali.hassan@example.com",
            roomId: iqbalRoom1.id,
        }
    });

    console.log("✅ Database seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
