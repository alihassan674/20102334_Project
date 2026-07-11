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

app.post("/api/addhostel", async (req, res) => {
    try {
        const {
            hostelName,
            hostelFloors,
            hostelAddress,
        } = req.body;

        const hostel = await prisma.hostel.create({
            data: {
                hostelName,
                hostelFloors: parseInt(hostelFloors, 10),
                hostelAddress,
            },
        });

        res.status(201).json({
            success: true,
            hostel,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
});

app.get("/api/hostels", async (req, res) => {
    try {
        const hostels = await prisma.hostel.findMany();
        res.status(200).json({
            success: true,
            hostels,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
