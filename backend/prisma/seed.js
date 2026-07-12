import { prisma } from "../prisma.js";

async function main() {
    console.log("🌱 Seeding database...");

    // Delete existing data
    await prisma.student.deleteMany();
    await prisma.room.deleteMany();
    await prisma.hostel.deleteMany();

    const hostels = [
        {
            hostelName: "Liberty Hall",
            hostelFloors: 5,
            hostelAddress: "1200 College Ave, Boston, MA",
        },
        {
            hostelName: "Maple Residence",
            hostelFloors: 4,
            hostelAddress: "450 University Blvd, Chicago, IL",
        },
        {
            hostelName: "Oakwood Residence",
            hostelFloors: 6,
            hostelAddress: "880 Campus Drive, Austin, TX",
        },
        {
            hostelName: "Evergreen Hall",
            hostelFloors: 5,
            hostelAddress: "300 Student Lane, Seattle, WA",
        },
        {
            hostelName: "Grand River Hostel",
            hostelFloors: 7,
            hostelAddress: "101 River Street, New York, NY",
        },
    ];

    const departments = [
        "Computer Science",
        "Software Engineering",
        "Information Technology",
        "Cyber Security",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering",
        "Business Administration",
        "Finance",
        "Architecture",
        "Mathematics",
        "Physics",
    ];

    const firstNames = [
        "James",
        "William",
        "Benjamin",
        "Lucas",
        "Mason",
        "Henry",
        "Jackson",
        "Alexander",
        "Daniel",
        "Michael",
        "Emma",
        "Olivia",
        "Sophia",
        "Charlotte",
        "Amelia",
        "Mia",
        "Harper",
        "Evelyn",
        "Abigail",
        "Emily",
        "Ethan",
        "Noah",
        "Logan",
        "Elijah",
        "Liam",
        "Avery",
        "Grace",
        "Scarlett",
        "Victoria",
        "Ella",
    ];

    const lastNames = [
        "Johnson",
        "Smith",
        "Williams",
        "Brown",
        "Jones",
        "Miller",
        "Davis",
        "Wilson",
        "Moore",
        "Taylor",
        "Anderson",
        "Thomas",
        "Jackson",
        "White",
        "Harris",
        "Martin",
        "Thompson",
        "Garcia",
        "Martinez",
        "Robinson",
    ];

    let registration = 1001;
    let emailCounter = 1;

    for (const hostelData of hostels) {
        const hostel = await prisma.hostel.create({
            data: hostelData,
        });

        for (let floor = 1; floor <= 4; floor++) {
            const room = await prisma.room.create({
                data: {
                    roomNumber: `${floor}0${floor}`,
                    floorNumber: floor,
                    capacity: 4,
                    hostelId: hostel.id,
                },
            });

            for (let i = 0; i < 3; i++) {
                const first =
                    firstNames[(registration + i) % firstNames.length];
                const last =
                    lastNames[(registration + i) % lastNames.length];

                await prisma.student.create({
                    data: {
                        firstName: first,
                        lastName: last,
                        registrationNo: `STU${registration}`,
                        department:
                            departments[
                            registration % departments.length
                            ],
                        phone: `+1${Math.floor(
                            2000000000 + Math.random() * 7000000000
                        )}`,
                        email: `${first.toLowerCase()}.${last.toLowerCase()}${emailCounter}@university.edu`,
                        roomId: room.id,
                    },
                });

                registration++;
                emailCounter++;
            }
        }
    }

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