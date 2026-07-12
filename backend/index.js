import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { prisma } from './prisma.js';

const app = express();
const PORT = process.env.PORT;

app.use(cors());                       // Allows Cross-Origin requests
app.use(express.json());               // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// --- Routes ---

// This will create a new hostel 
app.post("/api/addhostel", async (req, res) => {
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
    }); s
});


// This will give all hostel saved inside database 
app.get("/api/hostels", async (req, res) => {
    // getting all hostels from database 
    const hostels = await prisma.hostel.findMany();

    // sending results to frontend 
    res.status(200).json({
        success: true,
        hostels,
    });
});


// This will give all roomms inside one hostel 
app.get("/api/hostels/:hostelId/rooms", async (req, res) => {
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
app.get("/api/hostels/:hostelId/rooms/:roomId/students", async (req, res) => {
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

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
