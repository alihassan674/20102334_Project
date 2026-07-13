import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { prisma } from './prismaClient.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());                       // Allows Cross-Origin requests
app.use(express.json());               // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// --- Routes ---

// This will create a new hostel 
app.post("/api/v1/addhostel", async (req, res) => {
    // getting data comming from frontend 
    const {
        hostelName,
        hostelFloors,
        hostelAddress,
    } = req.body;

    // saving data in database 
    const hostel = await prisma.hostel.create({
        data: {
            hostelName,
            hostelFloors: parseInt(hostelFloors, 10),
            hostelAddress,
        },
    });

    // sending answer or response to frontend 
    res.status(201).json({
        success: true,
        hostel,
    });
});


// This will give all hostel saved inside database 
app.get("/api/v1/hostels", async (req, res) => {
    // getting all hostels from database 
    const hostels = await prisma.hostel.findMany();

    // sending results to frontend 
    res.status(200).json({
        success: true,
        hostels,
    });
});


// This will give all roomms inside one hostel 
app.get("/api/v1/hostels/:hostelId/rooms", async (req, res) => {
    // getting all rooms of specific hostel 
    const hostel = await prisma.hostel.findUnique({
        // where is a condition, based on this condition record are fetched 
        where: {
            id: parseInt(req.params.hostelId, 10),
        },

        // include mean add other table data ,  related to this , with this response  
        include: {
            rooms: {
                include: {
                    students: true,
                },
            },
        },
    });

    // send reponse to frontend 
    res.status(200).json({
        success: true,
        rooms: hostel.rooms,
    });
}
);


// this api will return all students based upon roomId and hostelId 
app.get("/api/v1/hostels/:hostelId/rooms/:roomId/students", async (req, res) => {
    // fetching data from frontend 
    const hostelId = Number(req.params.hostelId);
    const roomId = Number(req.params.roomId);

    // finding room of above hostelId and roomId 
    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            hostelId: hostelId,
        },
        include: {
            students: true,
        },
    });

    // sending response to frontend 
    res.status(200).json({
        success: true,
        students: room.students,
    });

});

// this api will delete hostel and cascade(below or related) rooms and students 
app.delete("/api/v1/deletehostel/:id", async (req, res) => {

    // take hostelid from frontend 
    const hostelId = Number(req.params.id);

    // delete database record on base of that id 
    await prisma.hostel.delete({
        where: {
            id: hostelId,
        },
    });

    // return a repsone of ok 
    return res.status(200).json({
        success: true,
        message: "Hostel and all related data deleted successfully.",
    });
});

// this api will delete room from hostel 
app.delete("/api/v1/rooms/:id", async (req, res) => {

    // take roomid from frontend 
    const roomId = Number(req.params.id);

    // delete database record on base of that id 
    await prisma.room.delete({
        where: {
            id: roomId,
        },
    });

    // return a repsone of ok 
    return res.status(200).json({
        success: true,
        message: "Room deleted successfully.",
    });
});

// this api will delete student from hostel 
app.delete("/api/v1/students/:id", async (req, res) => {

    // take studentid from frontend 
    const studentId = Number(req.params.id);

    // delete database record on base of that id 
    await prisma.student.delete({
        where: {
            id: studentId,
        },
    });

    // return a repsone of ok 
    return res.status(200).json({
        success: true,
        message: "Student deleted successfully.",
    });
});

// rhis api will create room inside hostel
app.post("/api/v1/hostels/:hostelId/rooms", async (req, res) => {
    // taking room id and hostel id from frontend
    const hostelId = Number(req.params.hostelId);
    const { roomNumber, floorNumber, capacity } = req.body;

    // this will create  room inside specific hostel
    const room = await prisma.room.create({
        data: {
            roomNumber,
            floorNumber: Number(floorNumber),
            capacity: Number(capacity),
            hostelId,
        },
    });

    return res.status(201).json({
        message: "Room created successfully.",
        room,
    });
});

// this api will create student inside room
app.post("/api/v1/hostels/:hostelId/rooms/:roomId/students", async (req, res) => {

    // taking room id and hostel id from frontend
    const roomId = Number(req.params.roomId);
    const {
        firstName,
        lastName,
        registrationNo,
        department,
        phone,
        email,
    } = req.body;

    // create student in room
    const student = await prisma.student.create({
        data: {
            firstName,
            lastName,
            registrationNo,
            department,
            phone: phone || null,
            email: email || null,
            roomId,
        },
    });

    // send response 
    return res.status(201).json({
        success: true,
        message: "Student created successfully.",
        student,

    });
});;

// this api will update hostel data with new data 
app.put("/api/v1/updatehostel/:id", async (req, res) => {

    // getting id of hostel from frontend api request url
    const { id } = req.params;

    // taking updated data from frontend form data
    const {
        hostelName,
        hostelFloors,
        hostelAddress,
    } = req.body;

    // update hostel data in 
    const updatedHostel = await prisma.hostel.update({
        where: {
            id: Number(id),
        },
        data: {
            hostelName,
            hostelFloors: Number(hostelFloors),
            hostelAddress,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Hostel updated successfully",
        hostel: updatedHostel,
    });
});

// this api will update room data with new data 
app.put("/api/v1/rooms/:id", async (req, res) => {

    // getting id of room from frontend api request url
    const { id } = req.params;

    // taking updated data from frontend form data
    const {
        roomNumber,
        floorNumber,
        capacity,
    } = req.body;

    // update room data in 
    const updatedRoom = await prisma.room.update({
        where: {
            id: Number(id),
        },
        data: {
            roomNumber,
            floorNumber: Number(floorNumber),
            capacity: Number(capacity),
        },
    });

    return res.status(200).json({
        success: true,
        message: "Room updated successfully",
        room: updatedRoom,
    });
});

// this api will update student data with new data 
app.put("/api/v1/students/:id", async (req, res) => {

    // getting id of student from frontend api request url
    const { id } = req.params;

    // taking updated data from frontend form data
    const {
        firstName,
        lastName,
        registrationNo,
        department,
        phone,
        email,
    } = req.body;

    // update student data in 
    const updatedStudent = await prisma.student.update({
        where: {
            id: Number(id),
        },
        data: {
            firstName,
            lastName,
            registrationNo,
            department,
            phone: phone || null,
            email: email || null,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        student: updatedStudent,
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
