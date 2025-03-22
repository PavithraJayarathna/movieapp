import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import MovieRouter from './routes/movie.js';
import UserRouter from './routes/user.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser());  // Parse cookies

// Enable CORS with proper origin and credentials handling
app.use(cors({
    origin: ["http://localhost:3000"], // Allow requests from frontend
    credentials: true, // Allow cookies and authorization headers
}));

// Use routers
app.use('/api', UserRouter);
app.use('/api', MovieRouter);

// Connect to MongoDB using environment variable for connection string

mongoose.connect('mongodb+srv://madumalijayarathna09:Chanmadu@cluster0.ekd0ilq.mongodb.net/movieapp?retryWrites=true&w=majority&appName=Cluster0')


// Start server
const PORT = process.env.PORT || 7000; // Use PORT from .env or fallback to 7000
app.listen(PORT, () => {
});
