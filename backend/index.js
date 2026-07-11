import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());                       // Allows Cross-Origin requests
app.use(express.json());               // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// --- Routes ---
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'Server is up and running!' });
});

// --- 404 Handler ---
app.use((req, res, next) => {
    res.status(404).json({ error: 'Resource not found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on our end!' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
